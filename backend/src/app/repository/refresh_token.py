# backend/src/app/repository/refresh_token.py
"""Refresh token repository.

Handles all DB access for the refresh_tokens table.
"""

import hashlib
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


def _hash(raw_token: str) -> str:
    """SHA-256 hex digest of a raw token string."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


class RefreshTokenRepository:

    @staticmethod
    def create(
        db: Session,
        *,
        user_id: int,
        raw_token: str,
        jti: str,
        expires_at: datetime,
        user_agent: str | None = None,
        ip: str | None = None,
    ) -> RefreshToken:
        """Persist a new refresh token (stored as a hash)."""
        record = RefreshToken(
            user_id=user_id,
            token_hash=_hash(raw_token),
            jti=jti,
            expires_at=expires_at,
            user_agent=user_agent,
            ip=ip,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_by_raw_token(db: Session, raw_token: str) -> RefreshToken | None:
        """Look up a refresh token record by the raw (unhashed) token value."""
        return (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == _hash(raw_token))
            .first()
        )

    @staticmethod
    def get_by_jti(db: Session, jti: str) -> RefreshToken | None:
        """Look up a refresh token record by JWT ID (jti claim)."""
        return db.query(RefreshToken).filter(RefreshToken.jti == jti).first()

    @staticmethod
    def revoke(db: Session, record: RefreshToken) -> RefreshToken:
        """Mark a single token as revoked."""
        record.revoked_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def revoke_all_for_user(db: Session, user_id: int) -> int:
        """Revoke every active token for a user (e.g. on password change / logout-all).
        Returns the number of rows updated."""
        now = datetime.now(timezone.utc)
        count = (
            db.query(RefreshToken)
            .filter(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
            .update({"revoked_at": now}, synchronize_session=False)
        )
        db.commit()
        return count

    @staticmethod
    def touch_last_used(db: Session, record: RefreshToken) -> None:
        """Update last_used_at timestamp on successful rotation."""
        record.last_used_at = datetime.now(timezone.utc)
        db.commit()
