from sqlalchemy import Column, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.db import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id1 = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_id2 = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user1 = relationship("User", foreign_keys=[user_id1], back_populates="conversation_as_user1")
    user2 = relationship("User", foreign_keys=[user_id2], back_populates="conversation_as_user2")

    messages = relationship("Message", back_populates="conversation", cascade="all, delete")


