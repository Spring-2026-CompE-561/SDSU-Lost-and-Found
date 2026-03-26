# src/app/models/user.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.db import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    first_name    = Column(String(15), nullable=False)
    last_name     = Column(String(15), nullable=False)
    email         = Column(String(30), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

# Relationships
 # RefreshToken → back_populates="user" (already set on RefreshToken model)
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    # Item → back_populates="owner" (Item model has: owner = relationship("User", back_populates="items"))
    items = relationship("Item", back_populates="owner", cascade="all, delete-orphan")

    # Message → back_populates="sender" (Message model has: sender = relationship("User", back_populates="message_sent", foreign_keys=[sender_id]))
    message_sent = relationship("Message", back_populates="sender", foreign_keys="[Message.sender_id]", cascade="all, delete-orphan")

    # Conversation as user1 → back_populates="user1" (Conversation model has: user1 = relationship("User", foreign_keys=[user_id1], back_populates="conversation_as_user1"))
    conversation_as_user1 = relationship("Conversation", foreign_keys="[Conversation.user_id1]", back_populates="user1", cascade="all, delete-orphan")

    # Conversation as user2 → back_populates="user2" (Conversation model has: user2 = relationship("User", foreign_keys=[user_id2], back_populates="conversation_as_user2"))
    conversation_as_user2 = relationship("Conversation", foreign_keys="[Conversation.user_id2]", back_populates="user2", cascade="all, delete-orphan")
