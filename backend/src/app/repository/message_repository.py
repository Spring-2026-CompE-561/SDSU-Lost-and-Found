# backend/src/app/repository/message_repository.py
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.message import Message


class MessageRepository:

    @staticmethod
    def get_by_id(db: Session, message_id: int) -> Message | None:
        """
        Return a message by its ID, or None if not found.
        """
        return db.query(Message).filter(Message.id == message_id).first()

    @staticmethod
    def list_by_conversation(
        db: Session,
        conversation_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Message]:
        """
        Return messages for a given conversation, ordered by created_at ascending.
        """
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        conversation_id: int,
        sender_id: int,
        content: str,
    ) -> Message:
        """
        Create a message in a conversation and return it.
        """
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message_text=content,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def delete(db: Session, message_id: int) -> bool:
        """
        Delete a message by ID.
        Returns True if deleted, False if not found.
        """
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            return False
        db.delete(message)
        db.commit()
        return True

    @staticmethod
    def get_last_message_for_conversation(
        db: Session,
        conversation_id: int,
    ) -> Message | None:
        """
        Return the most recent message for the conversation, or None if no messages.
        """
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .first()
        )