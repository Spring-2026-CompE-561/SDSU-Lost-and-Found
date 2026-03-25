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
 
    # RefreshToken model - ready, back_populates="refresh_tokens" is set on RefreshToken model.
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
 
    # Posts (Item model) - uncomment once teammate adds:
    #   owner = relationship("User", back_populates="posts")
    # posts = relationship("Item", back_populates="owner", cascade="all, delete-orphan")
 
    # Messages (Message model) - DO NOT uncomment yet, teammate has wrong class name "user" instead of "User"
    # and is missing back_populates. Coordinate with teammate first.
    # messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")
 
    # Conversations as user1 (Conversation model) - uncomment once teammate adds:
    #user1 = relationship("User", foreign_keys=[user_id1], back_populates="conversations_as_user1")
    # conversations_as_user1 = relationship("Conversation", foreign_keys="Conversation.user_id1", back_populates="user1", cascade="all, delete-orphan")
 
    # Conversations as user2 (Conversation model) - uncomment once teammate adds:
    #user2 = relationship("User", foreign_keys=[user_id2], back_populates="conversations_as_user2")
    # conversations_as_user2 = relationship("Conversation", foreign_keys="Conversation.user_id2", back_populates="user2", cascade="all, delete-orphan")
 
    # Auth tokens (UserToken model) - uncomment once teammate adds:
    #   user = relationship("User", back_populates="tokens")
    # tokens = relationship("UserToken", back_populates="user", cascade="all, delete-orphan")

