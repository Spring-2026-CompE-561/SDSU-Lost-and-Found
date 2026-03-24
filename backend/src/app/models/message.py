from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.core.db import Base


class Message(Base):
    __tablename__ = "messages"
 
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
 
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
 
    message_text = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
 
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates= "message_sent", foreign_keys=[sender_id])
