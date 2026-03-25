# backend/src/app/services/token_service.py $
"""Token service.

Implements the two-token auth flow:
  - Access token:  15 min, used for all API calls
  - Refresh token: 7 days, used only to get a new access token

Flow:
  1. User logs in with password → receives both tokens
  2. Access token expires after 15 min
  3. Client sends refresh token to POST /api/v1/token/refresh
     → if refresh token is valid and not expired: new access token issued
     → if refresh token is expired or revoked: 401, must log in again
  4. Refresh token expires after 7 days → must log in with password again
"""

from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.repository.refresh_token import RefreshTokenRepository
from app.repository.user import UserRepository


class TokenService:

    @staticmethod
    def _new_access_token(user_id: int) -> str:
        """Issue a short-lived access token."""
        return create_access_token(
            data={"sub": str(user_id), "scope": "user"},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )

    @staticmethod
    def issue_token_pair(db: Session, user_id: int) -> dict:
        """
        Called after a successful password login.
        Creates and stores a new refresh token, issues a new access token.

        Returns:
            dict matching TokenPairResponse: {token, refresh_token, userId}
        """
        access_token = TokenService._new_access_token(user_id)
        raw_refresh, jti, expires_at = create_refresh_token(user_id)

        RefreshTokenRepository.create(
            db,
            user_id=user_id,
            raw_token=raw_refresh,
            jti=jti,
            expires_at=expires_at,
        )

        return {
            "token": access_token,
            "refresh_token": raw_refresh,
            "userId": user_id,
        }

    @staticmethod
    def refresh_access_token(db: Session, raw_refresh_token: str) -> dict:
        """
        Called when the access token has expired.
        Validates the refresh token and issues a new access token.
        The refresh token itself is NOT rotated — it stays active
        until its own 7-day expiry.

        Returns:
            dict matching AccessTokenResponse: {token, refresh_token}

        Raises:
            401 if the refresh token is invalid, expired, or revoked.
        """
        # 1. Verify JWT signature, expiry, and scope claim
        payload = decode_refresh_token(raw_refresh_token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalid or expired. Please log in again.",
            )

        # 2. Confirm the token exists in the DB and has not been revoked
        record = RefreshTokenRepository.get_by_raw_token(db, raw_refresh_token)
        if record is None or record.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found or revoked. Please log in again.",
            )

        # 3. Confirm the user still exists
        user = UserRepository.get_by_id(db, record.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
            )

        # 4. Issue a new access token, update last_used timestamp
        access_token = TokenService._new_access_token(user.id)
        RefreshTokenRepository.touch_last_used(db, record)

        return {
            "token": access_token,
            "refresh_token": raw_refresh_token,
        }

    @staticmethod
    def revoke_token(db: Session, raw_refresh_token: str) -> None:
        """
        Called on logout.
        Revokes the refresh token so no further access tokens can be issued.
        Silently succeeds if token is already revoked or not found.
        """
        payload = decode_refresh_token(raw_refresh_token)
        if payload is None:
            return

        record = RefreshTokenRepository.get_by_raw_token(db, raw_refresh_token)
        if record and record.revoked_at is None:
            RefreshTokenRepository.revoke(db, record)