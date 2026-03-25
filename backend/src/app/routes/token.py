# backend/src/app/routes/token.py
"""Token endpoints.

POST /api/v1/token/refresh  — get a new access token using a valid refresh token
POST /api/v1/token/logout   — revoke a refresh token (logout)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.token import AccessTokenResponse, LogoutRequest, LogoutResponse, RefreshRequest
from app.services.token_service import TokenService

api_router = APIRouter(prefix="/token", tags=["token"])

DB = Annotated[Session, Depends(get_db)]


@api_router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    summary="Refresh access token",
    description=(
        "Submit a valid refresh token to receive a new access token. "
        "The refresh token remains active until its 7-day expiry. "
        "Returns 401 if the refresh token is invalid, expired, or revoked — "
        "in which case the user must log in with their password again."
    ),
)
def refresh_access_token(body: RefreshRequest, db: DB):
    return TokenService.refresh_access_token(db, body.refresh_token)


@api_router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout",
    description=(
        "Revoke the refresh token. The access token will expire naturally "
        "after its 15-minute TTL. Silently succeeds if already revoked."
    ),
)
def logout(body: LogoutRequest, db: DB):
    TokenService.revoke_token(db, body.refresh_token)
    return LogoutResponse()