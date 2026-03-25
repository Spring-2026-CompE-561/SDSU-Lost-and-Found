# src/app/models/refresh_token.py
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.db import Base

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    token_hash = Column(String(64), nullable=False, unique=True)  # sha256 hex
    jti = Column(String(36), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)

    user_agent = Column(String(256), nullable=True)
    ip = Column(String(45), nullable=True)

    user = relationship("User", back_populates="refresh_tokens")