# backend/src/app/repository/conversation_repository.py
from __future__ import annotations
from typing import Optional, Sequence


# Later this will be a SQLAlchemy Session type:
# from sqlalchemy.orm import Session


def get_by_id(db, conversation_id: int):
    """
    Return a conversation by its ID, or None if not found.
    """
    raise NotImplementedError


def get_by_user_pair(db, user_id1: int, user_id2: int):
    """
    Return the conversation for a pair of users if it exists, else None.
    NOTE: caller should pass IDs in normalized order (min, max).
    """
    raise NotImplementedError


def list_for_user(db, user_id: int, limit: int = 50, offset: int = 0):
    """
    Return conversations where user_id is a participant.
    """
    raise NotImplementedError


def create(db, user_id1: int, user_id2: int):
    """
    Create and return a new conversation for a pair of users.
    """
    raise NotImplementedError


def delete(db, conversation_id: int) -> bool:
    """
    Delete a conversation by ID.
    Returns True if deleted, False if not found.
    Messages should be deleted automatically via cascade at the DB/model level.
    """
    raise NotImplementedError