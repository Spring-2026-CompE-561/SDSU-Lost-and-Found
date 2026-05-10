"""Unit tests for app/services/token_service.py — TokenService."""

import pytest
from fastapi import HTTPException

from app.schemas.user import UserCreate
from app.services.token_service import TokenService
from app.services.user import UserService


def _make_user(db, email: str = "tokentester@sdsu.edu"):
    return UserService.signup(db, UserCreate(
        first_name="Token", last_name="Tester",
        email=email, password="TestPass1!",
    ))


# ---------------------------------------------------------------------------
# issue_token_pair
# ---------------------------------------------------------------------------

def test_issue_token_pair_returns_all_fields(db):
    user = _make_user(db)
    result = TokenService.issue_token_pair(db, user.id)
    assert "token" in result
    assert "refresh_token" in result
    assert result["userId"] == user.id


def test_issue_token_pair_token_is_string(db):
    user = _make_user(db)
    result = TokenService.issue_token_pair(db, user.id)
    assert isinstance(result["token"], str) and len(result["token"]) > 0
    assert isinstance(result["refresh_token"], str) and len(result["refresh_token"]) > 0


# ---------------------------------------------------------------------------
# refresh_access_token
# ---------------------------------------------------------------------------

def test_refresh_access_token_returns_new_token(db):
    user = _make_user(db)
    pair = TokenService.issue_token_pair(db, user.id)
    result = TokenService.refresh_access_token(db, pair["refresh_token"])
    assert "token" in result
    assert isinstance(result["token"], str)


def test_refresh_access_token_preserves_refresh_token(db):
    user = _make_user(db)
    pair = TokenService.issue_token_pair(db, user.id)
    result = TokenService.refresh_access_token(db, pair["refresh_token"])
    assert result["refresh_token"] == pair["refresh_token"]


def test_refresh_access_token_invalid_raises_401(db):
    with pytest.raises(HTTPException) as exc_info:
        TokenService.refresh_access_token(db, "not-a-valid-token")
    assert exc_info.value.status_code == 401


def test_refresh_access_token_revoked_raises_401(db):
    user = _make_user(db)
    pair = TokenService.issue_token_pair(db, user.id)
    TokenService.revoke_token(db, pair["refresh_token"])
    with pytest.raises(HTTPException) as exc_info:
        TokenService.refresh_access_token(db, pair["refresh_token"])
    assert exc_info.value.status_code == 401


# ---------------------------------------------------------------------------
# revoke_token
# ---------------------------------------------------------------------------

def test_revoke_token_succeeds(db):
    user = _make_user(db)
    pair = TokenService.issue_token_pair(db, user.id)
    # Should not raise
    TokenService.revoke_token(db, pair["refresh_token"])


def test_revoke_token_twice_is_idempotent(db):
    user = _make_user(db)
    pair = TokenService.issue_token_pair(db, user.id)
    TokenService.revoke_token(db, pair["refresh_token"])
    # Second call on an already-revoked token must not raise
    TokenService.revoke_token(db, pair["refresh_token"])


def test_revoke_invalid_token_does_not_raise(db):
    # Silently ignores tokens that cannot be decoded
    TokenService.revoke_token(db, "garbage-token-value")
