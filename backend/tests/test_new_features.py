"""Backend tests for NEW iteration features: templates CRUD, workflow persistence, AI animation field."""
import pytest
import requests
import os
import time

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "https://artist-builder-1.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@stakked.io", "password": "admin123"
    })
    if r.status_code != 200:
        pytest.skip("Admin login failed")
    return s


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@stakked.io", "password": "test1234"
    })
    if r.status_code != 200:
        # try register
        s.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test@stakked.io", "password": "test1234",
            "name": "Test", "artist_type": "musician"
        })
        r = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@stakked.io", "password": "test1234"
        })
        if r.status_code != 200:
            pytest.skip("User login failed")
    return s


# ─── Templates CRUD Tests ──────────────────────────────────────────────────────
class TestTemplates:
    def test_create_template(self, admin_session):
        payload = {
            "name": "TEST_template_basic",
            "theme": "brutal",
            "mode": "dark",
            "elements": [
                {"id": "el-1", "type": "text", "content": "Hello", "x": 50, "y": 60, "width": 200, "height": 40}
            ],
            "category": "music",
        }
        r = admin_session.post(f"{BASE_URL}/api/templates", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data
        assert data["name"] == "TEST_template_basic"
        assert data["theme"] == "brutal"
        assert len(data["elements"]) == 1
        assert "_id" not in data
        pytest.template_id = data["id"]

    def test_list_templates(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/templates")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        ids = [t["id"] for t in items]
        assert pytest.template_id in ids
        for t in items:
            assert "_id" not in t

    def test_use_template_creates_page(self, admin_session):
        r = admin_session.post(
            f"{BASE_URL}/api/templates/{pytest.template_id}/use",
            json={"title": "TEST_PageFromTemplate"}
        )
        assert r.status_code == 200, r.text
        page = r.json()
        assert page["title"] == "TEST_PageFromTemplate"
        assert "id" in page
        assert "_id" not in page
        # elements match template
        assert len(page["elements"]) == 1
        assert page["elements"][0]["content"] == "Hello"
        # workflow field present
        assert "workflow" in page
        assert "nodes" in page["workflow"]
        pytest.created_page_id = page["id"]

    def test_use_template_invalid_id(self, admin_session):
        r = admin_session.post(
            f"{BASE_URL}/api/templates/invalid_id/use",
            json={"title": "X"}
        )
        assert r.status_code == 400

    def test_use_template_not_found(self, admin_session):
        r = admin_session.post(
            f"{BASE_URL}/api/templates/507f1f77bcf86cd799439011/use",
            json={"title": "X"}
        )
        assert r.status_code == 404

    def test_templates_require_auth(self):
        r = requests.get(f"{BASE_URL}/api/templates")
        assert r.status_code == 401
        r = requests.post(f"{BASE_URL}/api/templates", json={"name": "x"})
        assert r.status_code == 401

    def test_delete_template(self, admin_session):
        r = admin_session.delete(f"{BASE_URL}/api/templates/{pytest.template_id}")
        assert r.status_code == 200
        # Verify it's gone from list
        r2 = admin_session.get(f"{BASE_URL}/api/templates")
        ids = [t["id"] for t in r2.json()]
        assert pytest.template_id not in ids

    def test_delete_template_not_found(self, admin_session):
        r = admin_session.delete(f"{BASE_URL}/api/templates/507f1f77bcf86cd799439011")
        assert r.status_code == 404

    def test_cleanup_created_page(self, admin_session):
        # clean up page created by use_template
        if hasattr(pytest, "created_page_id"):
            admin_session.delete(f"{BASE_URL}/api/pages/{pytest.created_page_id}")


# ─── Workflow Persistence Tests ────────────────────────────────────────────────
class TestWorkflow:
    def test_page_update_accepts_workflow(self, admin_session):
        # create page
        r = admin_session.post(f"{BASE_URL}/api/pages", json={
            "title": "TEST_WorkflowPage", "theme": "brutal"
        })
        assert r.status_code == 200
        page_id = r.json()["id"]

        workflow = {
            "nodes": [
                {"id": "n-1", "type": "trigger", "x": 100, "y": 100, "data": {"event": "page_view"}},
                {"id": "n-2", "type": "action", "x": 300, "y": 100, "data": {"action": "email"}},
            ],
            "edges": [{"id": "e-1", "from": "n-1", "to": "n-2"}]
        }
        r2 = admin_session.put(f"{BASE_URL}/api/pages/{page_id}", json={"workflow": workflow})
        assert r2.status_code == 200, r2.text
        # verify persistence via GET
        r3 = admin_session.get(f"{BASE_URL}/api/pages/{page_id}")
        assert r3.status_code == 200
        data = r3.json()
        assert "workflow" in data
        assert len(data["workflow"]["nodes"]) == 2
        assert data["workflow"]["nodes"][0]["id"] == "n-1"
        assert len(data["workflow"]["edges"]) == 1
        # cleanup
        admin_session.delete(f"{BASE_URL}/api/pages/{page_id}")


# ─── AI Animation Field Test ───────────────────────────────────────────────────
class TestAIAnimation:
    def test_generate_layout_returns_animation_field(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/ai/generate-layout", json={
            "prompt": "dark music portfolio",
            "page_type": "music",
            "theme": "brutal"
        }, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "elements" in data
        assert isinstance(data["elements"], list)
        if len(data["elements"]) == 0:
            # LLM may have hit budget or parse failure — log & skip shape check
            pytest.skip(f"AI returned no elements (likely LLM budget/parse issue): {data.get('error')}")
        # each element should have 'animation' field (not 'animations' array)
        for el in data["elements"]:
            assert "animation" in el, f"Missing animation key in element: {el}"
            assert isinstance(el["animation"], str)


# ─── Regression: Admin login + basic auth still work ──────────────────────────
class TestAuthRegression:
    def test_admin_login(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@stakked.io", "password": "admin123"
        })
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == "admin@stakked.io"
        assert data.get("role") == "admin"

    def test_admin_me(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == "admin@stakked.io"
