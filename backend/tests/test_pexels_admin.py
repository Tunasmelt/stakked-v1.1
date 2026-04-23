"""Tests for Pexels asset proxy, admin login, and theme persistence."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


# ─── Admin login test (review_request explicit item) ─────────────────────────
class TestAdminLogin:
    def test_admin_login_sets_cookie(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@stakked.io", "password": "admin123"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == "admin@stakked.io"
        # cookie
        assert "access_token" in s.cookies or any("token" in c.name.lower() for c in s.cookies)
        # /me
        me = s.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == "admin@stakked.io"

    def test_register_duplicate_rejected(self):
        ts = int(time.time())
        email = f"TEST_dup_{ts}@stakked.io"
        r1 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "abcd1234", "name": "Dup"
        })
        assert r1.status_code == 200
        # second attempt
        r2 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "abcd1234", "name": "Dup"
        })
        assert r2.status_code in (400, 409)


# ─── Pexels proxy tests ──────────────────────────────────────────────────────
class TestPexelsProxy:
    def test_search_returns_photos(self):
        r = requests.get(f"{BASE_URL}/api/assets/search", params={"q": "art", "per_page": 5})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "photos" in data
        assert isinstance(data["photos"], list)
        if data["photos"]:
            p = data["photos"][0]
            # Expected sanitized fields
            assert "id" in p
            assert "alt" in p
            assert "photographer" in p
            assert "src" in p
            assert "small" in p["src"]
            assert "medium" in p["src"]
            assert "large2x" in p["src"]

    def test_search_does_not_leak_api_key(self):
        pexels_key = os.environ.get("PEXELS_API_KEY", "tuXHsmWQrEXBbOJK9XGzKJMO1fFK5BW4EWzHJ8EXJnkJrFQ80kJBzGFh")
        r = requests.get(f"{BASE_URL}/api/assets/search", params={"q": "art", "per_page": 3})
        assert r.status_code == 200
        body_text = r.text
        # Key should not appear anywhere in response
        assert pexels_key not in body_text
        # Also check common leak paths (headers)
        assert "Authorization" not in r.headers


# ─── Pages CRUD with theme persistence ───────────────────────────────────────
class TestPageThemePersistence:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.s = requests.Session()
        r = self.s.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@stakked.io", "password": "admin123"
        })
        assert r.status_code == 200

    def test_create_update_theme_and_persist(self):
        # CREATE
        r = self.s.post(f"{BASE_URL}/api/pages", json={
            "title": "TEST_ThemePersist", "theme": "neon"
        })
        assert r.status_code == 200
        pid = r.json()["id"]
        # UPDATE theme/mode/elements/sub_pages
        payload = {
            "theme": "ghost",
            "mode": "dark",
            "elements": [{"id": "el-1", "type": "text", "x": 0, "y": 0, "w": 200, "h": 60,
                          "content": {"text": "Hello"}, "zIndex": 0}],
            "sub_pages": [
                {"id": "sp1", "name": "Home", "slug": "home", "elements": []},
                {"id": "sp2", "name": "About", "slug": "about", "elements": []},
            ]
        }
        r2 = self.s.put(f"{BASE_URL}/api/pages/{pid}", json=payload)
        assert r2.status_code == 200, r2.text
        # GET back and verify
        r3 = self.s.get(f"{BASE_URL}/api/pages/{pid}")
        assert r3.status_code == 200
        data = r3.json()
        assert data["theme"] == "ghost"
        assert data.get("mode") == "dark"
        assert len(data.get("elements") or []) == 1
        assert len(data.get("sub_pages") or []) == 2
