"""Unit tests for app/core/auth.py — password hashing and JWT helpers."""

from datetime import timedelta

import pytest

from app.core.auth import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def test_hash_is_not_plaintext():
    hashed = get_password_hash("TestPass1!")
    assert hashed != "TestPass1!"


def test_verify_correct_password():
    hashed = get_password_hash("TestPass1!")
    assert verify_password("TestPass1!", hashed) is True


def test_verify_wrong_password():
    hashed = get_password_hash("TestPass1!")
    assert verify_password("WrongPass9@", hashed) is False


def test_different_passwords_produce_different_hashes():
    h1 = get_password_hash("TestPass1!")
    h2 = get_password_hash("TestPass1!")
    # argon2 uses a random salt, so two hashes of the same password differ
    assert h1 != h2


# ---------------------------------------------------------------------------
# Access token
# ---------------------------------------------------------------------------

def test_create_and_verify_access_token():
    data = {"sub": "42", "scope": "user"}
    token = create_access_token(data)
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["scope"] == "user"


def test_access_token_with_custom_expiry():
    token = create_access_token({"sub": "1", "scope": "user"}, expires_delta=timedelta(hours=1))
    payload = verify_token(token)
    assert payload is not None


def test_verify_token_invalid_string():
    assert verify_token("not.a.real.token") is None


def test_verify_token_expired():
    token = create_access_token({"sub": "1", "scope": "user"}, expires_delta=timedelta(seconds=-1))
    assert verify_token(token) is None


def test_verify_token_tampered():
    token = create_access_token({"sub": "1", "scope": "user"})
    tampered = token[:-4] + "xxxx"
    assert verify_token(tampered) is None


# ---------------------------------------------------------------------------
# Refresh token
# ---------------------------------------------------------------------------

def test_create_refresh_token_structure():
    raw, jti, expires_at = create_refresh_token(user_id=7)
    assert isinstance(raw, str)
    assert isinstance(jti, str) and len(jti) > 0


def test_decode_refresh_token_valid():
    raw, jti, _ = create_refresh_token(user_id=99)
    payload = decode_refresh_token(raw)
    assert payload is not None
    assert payload["sub"] == "99"
    assert payload["scope"] == "refresh"
    assert payload["jti"] == jti


def test_decode_refresh_token_invalid():
    assert decode_refresh_token("garbage-token") is None


def test_decode_refresh_token_rejects_access_token():
    # An access token must not be accepted as a refresh token
    access = create_access_token({"sub": "1", "scope": "user"})
    assert decode_refresh_token(access) is None


def test_decode_refresh_token_expired():
    from datetime import UTC, datetime
    import jwt
    from app.core.auth import SECRET_KEY, ALGORITHM

    payload = {
        "sub": "1",
        "jti": "some-jti",
        "scope": "refresh",
        "exp": datetime.now(UTC) - timedelta(seconds=1),
        "iat": datetime.now(UTC),
    }
    expired_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    assert decode_refresh_token(expired_token) is None
