# backend/src/app/repository/message_repository.py
from __future__ import annotations


def get_by_id(db, message_id: int):
    """
    Return a message by its ID, or None if not found.
    """
    raise NotImplementedError


def list_by_conversation(db, conversation_id: int, limit: int = 50, offset: int = 0):
    """
    Return messages for a given conversation, ordered by created_at ascending (or timestamp).
    """
    raise NotImplementedError


def create(db, conversation_id: int, sender_id: int, content: str):
    """
    Create a message in a conversation and return it.
    """
    raise NotImplementedError


def delete(db, message_id: int) -> bool:
    """
    Delete a message by ID.
    Returns True if deleted, False if not found.
    """
    raise NotImplementedError


def get_last_message_for_conversation(db, conversation_id: int):
    """
    Optional helper for GET /conversations preview.
    Return the most recent message for the conversation, or None if no messages.
    """
    raise NotImplementedError