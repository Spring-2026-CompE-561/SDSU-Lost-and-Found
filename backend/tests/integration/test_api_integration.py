"""Integration tests — Frontend ↔ Backend API connection.

Each test class simulates the exact HTTP calls that the Next.js frontend
(src/lib/api.ts and the page components) makes against the FastAPI backend.
Running these tests proves the two sides are wired together correctly.
"""

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_USER_A = {
    "first_name": "Jane",
    "last_name": "Aztec",
    "email": "jane@sdsu.edu",
    "password": "TestPass1!",
}

_USER_B = {
    "first_name": "John",
    "last_name": "Aztec",
    "email": "john@sdsu.edu",
    "password": "TestPass1!",
}


def _signup_and_login(client, user_data: dict) -> dict:
    """Register a user, log them in, and return auth context."""
    signup = client.post("/api/v1/user/signup", json=user_data)
    assert signup.status_code == 201, signup.text
    user_id = signup.json()["userId"]

    login = client.post("/api/v1/user/login", json={
        "email": user_data["email"],
        "password": user_data["password"],
    })
    assert login.status_code == 200, login.text
    data = login.json()
    return {
        "user_id": user_id,
        "token": data["token"],
        "refresh_token": data["refresh_token"],
        "headers": {"Authorization": f"Bearer {data['token']}"},
    }


# ---------------------------------------------------------------------------
# Auth flow  (mirrors: login/page.tsx → POST /user/login)
# ---------------------------------------------------------------------------

class TestAuthFlow:
    """Signup → login → profile fetch → token refresh → logout."""

    def test_signup_returns_user_id(self, client):
        resp = client.post("/api/v1/user/signup", json=_USER_A)
        assert resp.status_code == 201
        body = resp.json()
        assert "userId" in body
        assert isinstance(body["userId"], int)

    def test_signup_with_non_sdsu_email_is_rejected(self, client):
        bad = {**_USER_A, "email": "jane@gmail.com"}
        resp = client.post("/api/v1/user/signup", json=bad)
        assert resp.status_code == 422

    def test_login_returns_token_pair(self, client):
        client.post("/api/v1/user/signup", json=_USER_A)
        resp = client.post("/api/v1/user/login", json={
            "email": _USER_A["email"],
            "password": _USER_A["password"],
        })
        assert resp.status_code == 200
        body = resp.json()
        assert "token" in body
        assert "refresh_token" in body
        assert "userId" in body

    def test_login_wrong_password_returns_401(self, client):
        client.post("/api/v1/user/signup", json=_USER_A)
        resp = client.post("/api/v1/user/login", json={
            "email": _USER_A["email"],
            "password": "WrongPass9@",
        })
        assert resp.status_code == 401

    def test_get_user_profile_with_valid_token(self, client):
        auth = _signup_and_login(client, _USER_A)
        resp = client.get(f"/api/v1/user/{auth['user_id']}")
        assert resp.status_code == 200
        body = resp.json()
        assert body["email"] == _USER_A["email"]
        assert body["first_name"] == _USER_A["first_name"]

    def test_token_refresh_issues_new_access_token(self, client):
        """Mirrors the tryRefreshToken() call in api.ts."""
        auth = _signup_and_login(client, _USER_A)
        resp = client.post("/api/v1/token/refresh", json={
            "refresh_token": auth["refresh_token"],
        })
        assert resp.status_code == 200
        body = resp.json()
        assert "token" in body
        assert isinstance(body["token"], str)

    def test_logout_revokes_refresh_token(self, client):
        """After logout the refresh token must no longer work."""
        auth = _signup_and_login(client, _USER_A)
        logout = client.post("/api/v1/token/logout", json={
            "refresh_token": auth["refresh_token"],
        })
        assert logout.status_code == 200

        refresh = client.post("/api/v1/token/refresh", json={
            "refresh_token": auth["refresh_token"],
        })
        assert refresh.status_code == 401

    def test_protected_endpoint_rejects_missing_token(self, client):
        """Unauthenticated requests to protected routes get 401/403."""
        resp = client.get("/api/v1/home/my-posts")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Items flow  (mirrors: home/page.tsx → GET /home/, POST /home/, etc.)
# ---------------------------------------------------------------------------

class TestItemsFlow:
    """Create, list, update, and delete lost/found item posts."""

    def test_list_items_is_public(self, client):
        """Home page fetches items without an auth token."""
        resp = client.get("/api/v1/home/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_item_requires_auth(self, client):
        resp = client.post("/api/v1/home/", json={
            "title": "Lost Keys", "description": "car keys",
            "location": "Parking Lot A", "report_type": "lost",
        })
        assert resp.status_code in (401, 403)

    def test_create_and_retrieve_item(self, client):
        auth = _signup_and_login(client, _USER_A)
        create = client.post("/api/v1/home/", json={
            "title": "Lost SDSU ID",
            "description": "Blue and white student ID card",
            "location": "Student Union",
            "report_type": "lost",
        }, headers=auth["headers"])
        assert create.status_code == 200
        item = create.json()
        assert item["title"] == "Lost SDSU ID"
        assert item["user_id"] == auth["user_id"]

        get = client.get(f"/api/v1/home/{item['id']}")
        assert get.status_code == 200
        assert get.json()["id"] == item["id"]

    def test_created_item_appears_in_listing(self, client):
        auth = _signup_and_login(client, _USER_A)
        client.post("/api/v1/home/", json={
            "title": "Found Laptop",
            "description": "MacBook Pro found in GMCS",
            "location": "GMCS 307",
            "report_type": "found",
        }, headers=auth["headers"])

        resp = client.get("/api/v1/home/")
        assert resp.status_code == 200
        titles = [i["title"] for i in resp.json()]
        assert "Found Laptop" in titles

    def test_my_posts_returns_only_caller_items(self, client):
        auth_a = _signup_and_login(client, _USER_A)
        auth_b = _signup_and_login(client, _USER_B)

        client.post("/api/v1/home/", json={
            "title": "Jane's Item", "description": "d", "location": "l", "report_type": "lost",
        }, headers=auth_a["headers"])
        client.post("/api/v1/home/", json={
            "title": "John's Item", "description": "d", "location": "l", "report_type": "found",
        }, headers=auth_b["headers"])

        resp = client.get("/api/v1/home/my-posts", headers=auth_a["headers"])
        assert resp.status_code == 200
        posts = resp.json()
        assert all(p["user_id"] == auth_a["user_id"] for p in posts)
        assert len(posts) == 1

    def test_update_item_by_owner(self, client):
        auth = _signup_and_login(client, _USER_A)
        create = client.post("/api/v1/home/", json={
            "title": "Old Title", "description": "d", "location": "l", "report_type": "lost",
        }, headers=auth["headers"])
        item_id = create.json()["id"]

        update = client.put(f"/api/v1/home/{item_id}", json={"title": "Updated Title"},
                            headers=auth["headers"])
        assert update.status_code == 200
        assert update.json()["success"] is True

    def test_update_item_by_non_owner_returns_403(self, client):
        auth_a = _signup_and_login(client, _USER_A)
        auth_b = _signup_and_login(client, _USER_B)
        create = client.post("/api/v1/home/", json={
            "title": "A's Item", "description": "d", "location": "l", "report_type": "lost",
        }, headers=auth_a["headers"])
        item_id = create.json()["id"]

        resp = client.put(f"/api/v1/home/{item_id}", json={"title": "Hijacked"},
                          headers=auth_b["headers"])
        assert resp.status_code == 403

    def test_delete_item_by_owner(self, client):
        auth = _signup_and_login(client, _USER_A)
        create = client.post("/api/v1/home/", json={
            "title": "To Delete", "description": "d", "location": "l", "report_type": "lost",
        }, headers=auth["headers"])
        item_id = create.json()["id"]

        delete = client.delete(f"/api/v1/home/{item_id}", headers=auth["headers"])
        assert delete.status_code == 200

        get = client.get(f"/api/v1/home/{item_id}")
        assert get.status_code == 404

    def test_delete_item_by_non_owner_returns_403(self, client):
        auth_a = _signup_and_login(client, _USER_A)
        auth_b = _signup_and_login(client, _USER_B)
        create = client.post("/api/v1/home/", json={
            "title": "A's Item", "description": "d", "location": "l", "report_type": "lost",
        }, headers=auth_a["headers"])
        item_id = create.json()["id"]

        resp = client.delete(f"/api/v1/home/{item_id}", headers=auth_b["headers"])
        assert resp.status_code == 403

    def test_get_nonexistent_item_returns_404(self, client):
        resp = client.get("/api/v1/home/99999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# User profile update flow  (mirrors: account/page.tsx)
# ---------------------------------------------------------------------------

class TestUserProfileFlow:
    """Update and delete user account."""

    def test_update_profile_name(self, client):
        auth = _signup_and_login(client, _USER_A)
        resp = client.put(f"/api/v1/user/{auth['user_id']}", json={"first_name": "Janet"})
        assert resp.status_code == 200
        assert resp.json()["user"]["first_name"] == "Janet"

    def test_delete_account_removes_user(self, client):
        auth = _signup_and_login(client, _USER_A)
        delete = client.delete(f"/api/v1/user/{auth['user_id']}")
        assert delete.status_code == 200

        get = client.get(f"/api/v1/user/{auth['user_id']}")
        assert get.status_code == 404

    def test_duplicate_signup_returns_400(self, client):
        client.post("/api/v1/user/signup", json=_USER_A)
        resp = client.post("/api/v1/user/signup", json=_USER_A)
        assert resp.status_code == 400
