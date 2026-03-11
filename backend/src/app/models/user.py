# src/app/models/user.py
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    first_name    = Column(String(15), nullable=False)
    last_name     = Column(String(15), nullable=False)
    email         = Column(String(30), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # Relationships
    # Posts (Item model) - cascade ensures a user's posts are deleted with the user.
    # posts = relationship("Item", back_populates="owner", cascade="all, delete-orphan")

    # Messages (Message model) - cascade ensures a user's sent messages are deleted with the user.
    # messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")

    # Auth tokens (UserToken model) - cascade ensures a user's tokens are deleted with the user.
    # tokens = relationship("UserToken", back_populates="user", cascade="all, delete-orphan")