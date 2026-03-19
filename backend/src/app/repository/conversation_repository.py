# backend/src/app/repository/conversation_repository.py
from sqlalchemy.orm import Session
from app.models.conversation import Conversation


class ConversationRepository:

    @staticmethod
    def get_by_id(db: Session, conversation_id: int) -> Conversation | None:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    @staticmethod
    def get_by_user_pair(db: Session, user_id1: int, user_id2: int) -> Conversation | None:
        return db.query(Conversation).filter(
            ((Conversation.user_id1 == user_id1) & (Conversation.user_id2 == user_id2)) |
            ((Conversation.user_id1 == user_id2) & (Conversation.user_id2 == user_id1))
        ).first()

    @staticmethod
    def list_for_user(db: Session, user_id: int, limit: int = 50, offset: int = 0):
        return (
            db.query(Conversation)
            .filter(
                (Conversation.user_id1 == user_id) | (Conversation.user_id2 == user_id)
            )
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, user_id1: int, user_id2: int) -> Conversation:
        convo = Conversation(user_id1=user_id1, user_id2=user_id2)
        db.add(convo)
        db.commit()
        db.refresh(convo)
        return convo

    @staticmethod
    def delete(db: Session, db_conversation: Conversation) -> None:
        db.delete(db_conversation)
        db.commit()