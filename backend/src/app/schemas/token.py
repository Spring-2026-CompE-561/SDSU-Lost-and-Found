# backend/src/app/schemas/token.py
"""Pydantic schemas for token endpoints."""

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------


class RefreshRequest(BaseModel):
    """Body for POST /api/v1/token/refresh."""

    refresh_token: str = Field(..., description="The active refresh token.")


class LogoutRequest(BaseModel):
    """Body for POST /api/v1/token/logout."""

    refresh_token: str = Field(..., description="The refresh token to revoke.")


# ---------------------------------------------------------------------------
# Response bodies
# ---------------------------------------------------------------------------


class TokenPairResponse(BaseModel):
    """
    Returned after a successful password login.
    Field names match the spec: {token, userId} plus refresh_token.
    """

    token: str           # short-lived access token (15 min)
    refresh_token: str   # long-lived refresh token (7 days)
    userId: int


class AccessTokenResponse(BaseModel):
    """
    Returned after a successful token refresh.
    Returns a new access token; the same refresh token is reused
    until its 7-day expiry.
    """

    token: str           # new short-lived access token
    refresh_token: str   # same refresh token passed in


class LogoutResponse(BaseModel):
    """Returned after revoking a refresh token."""

    success: bool = True