"""Unit tests for app/services/user.py — UserService."""

import pytest
from fastapi import HTTPException

from app.schemas.user import UserCreate, UserUpdate
from app.services.user import UserService

_USER = UserCreate(
    first_name="Alice",
    last_name="Smith",
    email="alice@sdsu.edu",
    password="TestPass1!",
)


# ---------------------------------------------------------------------------
# signup
# ---------------------------------------------------------------------------

def test_signup_creates_user(db):
    user = UserService.signup(db, _USER)
    assert user.id is not None
    assert user.email == "alice@sdsu.edu"
    assert user.first_name == "Alice"
    assert user.last_name == "Smith"


def test_signup_hashes_password(db):
    user = UserService.signup(db, _USER)
    assert user.password_hash != "TestPass1!"


def test_signup_duplicate_email_raises_400(db):
    UserService.signup(db, _USER)
    with pytest.raises(HTTPException) as exc_info:
        UserService.signup(db, _USER)
    assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# login
# ---------------------------------------------------------------------------

def test_login_returns_token_and_user_id(db):
    created = UserService.signup(db, _USER)
    token, user_id = UserService.login(db, "alice@sdsu.edu", "TestPass1!")
    assert isinstance(token, str) and len(token) > 0
    assert user_id == created.id


def test_login_wrong_password_raises_401(db):
    UserService.signup(db, _USER)
    with pytest.raises(HTTPException) as exc_info:
        UserService.login(db, "alice@sdsu.edu", "Wrong1!")
    assert exc_info.value.status_code == 401


def test_login_unknown_email_raises_401(db):
    with pytest.raises(HTTPException) as exc_info:
        UserService.login(db, "nobody@sdsu.edu", "TestPass1!")
    assert exc_info.value.status_code == 401

def test_signup_stores_email_lowercase(db):
    user = UserService.signup(
        db,
        UserCreate(
            first_name="Alan",
            last_name="User",
            email="Alan@SDSU.edu",
            password="TestPass1!",
        ),
    )

    assert user.email == "alan@sdsu.edu"


def test_signup_allows_dot_variant_as_different_email(db):
    first = UserService.signup(
        db,
        UserCreate(
            first_name="Alan",
            last_name="User",
            email="user1@sdsu.edu",
            password="TestPass1!",
        ),
    )

    second = UserService.signup(
        db,
        UserCreate(
            first_name="Other",
            last_name="User",
            email="u.ser1@sdsu.edu",
            password="TestPass1!",
        ),
    )

    assert first.id != second.id
    assert first.email == "user1@sdsu.edu"
    assert second.email == "u.ser1@sdsu.edu"


def test_login_accepts_uppercase_email(db):
    created = UserService.signup(
        db,
        UserCreate(
            first_name="Alan",
            last_name="User",
            email="user1@sdsu.edu",
            password="TestPass1!",
        ),
    )

    token, user_id = UserService.login(db, "User1@SDSU.edu", "TestPass1!")

    assert isinstance(token, str)
    assert user_id == created.id


def test_login_dot_variant_fails_for_different_email(db):
    UserService.signup(
        db,
        UserCreate(
            first_name="Alan",
            last_name="User",
            email="user1@sdsu.edu",
            password="TestPass1!",
        ),
    )

    with pytest.raises(HTTPException) as exc_info:
        UserService.login(db, "u.ser1@sdsu.edu", "TestPass1!")

    assert exc_info.value.status_code == 401
# ---------------------------------------------------------------------------
# get_user
# ---------------------------------------------------------------------------

def test_get_user_returns_user(db):
    created = UserService.signup(db, _USER)
    found = UserService.get_user(db, created.id)
    assert found.id == created.id
    assert found.email == created.email


def test_get_user_not_found_raises_404(db):
    with pytest.raises(HTTPException) as exc_info:
        UserService.get_user(db, 99999)
    assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# update_user
# ---------------------------------------------------------------------------

def test_update_user_first_name(db):
    user = UserService.signup(db, _USER)
    updated = UserService.update_user(db, user.id, UserUpdate(first_name="Alicia"))
    assert updated.first_name == "Alicia"


def test_update_user_last_name(db):
    user = UserService.signup(db, _USER)
    updated = UserService.update_user(db, user.id, UserUpdate(last_name="Jones"))
    assert updated.last_name == "Jones"


def test_update_user_email(db):
    user = UserService.signup(db, _USER)
    updated = UserService.update_user(db, user.id, UserUpdate(email="alice2@sdsu.edu"))
    assert updated.email == "alice2@sdsu.edu"


def test_update_user_same_email_is_accepted(db):
    user = UserService.signup(db, _USER)
    # Updating to the same email should not raise
    updated = UserService.update_user(db, user.id, UserUpdate(email="alice@sdsu.edu"))
    assert updated.email == "alice@sdsu.edu"


def test_update_user_email_conflict_raises_400(db):
    user1 = UserService.signup(db, _USER)
    user2 = UserService.signup(db, UserCreate(
        first_name="Bob", last_name="Brown",
        email="bob@sdsu.edu", password="TestPass1!",
    ))
    with pytest.raises(HTTPException) as exc_info:
        UserService.update_user(db, user2.id, UserUpdate(email="alice@sdsu.edu"))
    assert exc_info.value.status_code == 400


def test_update_user_not_found_raises_404(db):
    with pytest.raises(HTTPException) as exc_info:
        UserService.update_user(db, 99999, UserUpdate(first_name="X"))
    assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# delete_user
# ---------------------------------------------------------------------------

def test_delete_user_removes_user(db):
    user = UserService.signup(db, _USER)
    UserService.delete_user(db, user.id)
    with pytest.raises(HTTPException) as exc_info:
        UserService.get_user(db, user.id)
    assert exc_info.value.status_code == 404


def test_delete_user_not_found_raises_404(db):
    with pytest.raises(HTTPException) as exc_info:
        UserService.delete_user(db, 99999)
    assert exc_info.value.status_code == 404
