"""Backend tests for Stakked - auth, pages, AI endpoints"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://artist-builder-1.preview.emergentagent.com").rstrip("/")

# ─── Auth Tests ───────────────────────────────────────────────────────────────
class TestAuth:
    def test_register_new_user(self):
        ts = int(time.time())
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_user_{ts}@stakked.io",
            "password": "testpass123",
            "name": "Test Artist",
            "artist_type": "musician"
        })
        assert r.status_code == 200
        data = r.json()
        assert "email" in data
        assert "id" in data

    def test_login_valid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@stakked.io",
            "password": "test1234"
        })
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert data["email"] == "test@stakked.io"

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@stakked.io",
            "password": "wrongpassword"
        })
        assert r.status_code == 401

    def test_me_without_auth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_auth(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@stakked.io",
            "password": "test1234"
        })
        r = session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == "test@stakked.io"
        assert "password_hash" not in data

    def test_logout(self):
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@stakked.io",
            "password": "test1234"
        })
        r = session.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        # After logout, /me should fail
        r2 = session.get(f"{BASE_URL}/api/auth/me")
        assert r2.status_code == 401


# ─── Pages Tests ──────────────────────────────────────────────────────────────
class TestPages:
    @pytest.fixture(autouse=True)
    def auth_session(self):
        self.session = requests.Session()
        r = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@stakked.io",
            "password": "test1234"
        })
        if r.status_code != 200:
            pytest.skip("Auth failed")

    def test_list_pages(self):
        r = self.session.get(f"{BASE_URL}/api/pages")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_page(self):
        r = self.session.post(f"{BASE_URL}/api/pages", json={
            "title": "TEST_Page",
            "theme": "neon",
            "page_type": "music"
        })
        assert r.status_code == 200
        data = r.json()
        assert "id" in data
        assert data["title"] == "TEST_Page"
        self.page_id = data["id"]

    def test_create_and_get_page(self):
        r = self.session.post(f"{BASE_URL}/api/pages", json={
            "title": "TEST_GetPage",
            "theme": "ghost"
        })
        assert r.status_code == 200
        page_id = r.json()["id"]

        r2 = self.session.get(f"{BASE_URL}/api/pages/{page_id}")
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_GetPage"

    def test_update_page(self):
        r = self.session.post(f"{BASE_URL}/api/pages", json={"title": "TEST_UpdateMe", "theme": "neon"})
        page_id = r.json()["id"]

        r2 = self.session.put(f"{BASE_URL}/api/pages/{page_id}", json={"title": "TEST_Updated"})
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_Updated"

    def test_delete_page(self):
        r = self.session.post(f"{BASE_URL}/api/pages", json={"title": "TEST_DeleteMe", "theme": "neon"})
        page_id = r.json()["id"]

        r2 = self.session.delete(f"{BASE_URL}/api/pages/{page_id}")
        assert r2.status_code in [200, 204]

        r3 = self.session.get(f"{BASE_URL}/api/pages/{page_id}")
        assert r3.status_code == 404

    def test_publish_page(self):
        r = self.session.post(f"{BASE_URL}/api/pages", json={"title": "TEST_Publish", "theme": "neon"})
        page_id = r.json()["id"]

        r2 = self.session.put(f"{BASE_URL}/api/pages/{page_id}", json={"published": True, "slug": f"test-publish-{int(time.time())}"})
        assert r2.status_code == 200
        data = r2.json()
        assert data.get("published") == True

    def test_pages_without_auth(self):
        r = requests.get(f"{BASE_URL}/api/pages")
        assert r.status_code == 401


# ─── Gallery Tests ────────────────────────────────────────────────────────────
class TestGallery:
    def test_gallery_published_pages(self):
        r = requests.get(f"{BASE_URL}/api/pages/published")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
