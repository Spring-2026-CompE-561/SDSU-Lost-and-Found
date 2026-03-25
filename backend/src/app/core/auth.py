# app/core/auth.py
from datetime import UTC, datetime, timedelta
import uuid

import jwt
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError
from pwdlib import PasswordHash

from app.core.settings import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = settings.refresh_token_expire_days

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/user/login")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: The data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int) -> tuple[str, str, datetime]:
    """
    Create a JWT refresh token.

    Args:
        user_id: The user ID to encode in the token

    Returns:
        tuple[str, str, datetime]: (raw_token, jti, expires_at)
            raw_token — the encoded JWT (store only its hash in the DB)
            jti       — unique token ID for lookup
            expires_at — UTC datetime when the token expires
    """
    jti = str(uuid.uuid4())
    expires_at = datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "scope": "refresh",
        "exp": expires_at,
        "iat": datetime.now(UTC),
    }
    raw_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return raw_token, jti, expires_at


def decode_refresh_token(raw_token: str) -> dict | None:
    """
    Verify and decode a refresh token JWT.

    Args:
        raw_token: The encoded refresh token

    Returns:
        dict | None: Decoded payload if valid, None if invalid/expired/wrong scope
    """
    try:
        payload = jwt.decode(
            raw_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except PyJWTError:
        return None
    if payload.get("scope") != "refresh":
        return None
    return payload


def get_password_hash(password: str) -> str:
    """
    Hash a plaintext password.

    Args:
        password: The plaintext password to hash

    Returns:
        str: The hashed password
    """
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a hashed password.

    Args:
        plain_password: The plaintext password to verify
        hashed_password: The hashed password to compare against

    Returns:
        bool: True if password matches, False otherwise
    """
    return password_hash.verify(plain_password, hashed_password)


def verify_token(token: str) -> dict | None:
    """
    Verify and decode an access token JWT.

    Args:
        token: The JWT token to verify

    Returns:
        dict | None: The decoded payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except PyJWTError:
        return None
    else:
        return payload