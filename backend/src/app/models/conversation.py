from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.db import Base

class conversation(Base):
    __tablename__ = "Conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id1 = Column(Integer, ForeignKey("user.id"), nullable=False)
    user_id2 = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user1 = relationship("User", foreign_keys=[user_id1])
    user2 = relationship("User", foreign_keys=[user_id2])


        #Messages name needs to match with tablename of message data model -  To make sure messages would get delete if a conversation is deleted 
    messages = relationship("messages", back_populates="conversation", cascade="all, delete")


