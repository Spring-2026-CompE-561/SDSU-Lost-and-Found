# backend/src/app/services/chat_service.py
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
 
from app.repository.conversation_repository import ConversationRepository
from app.repository.message_repository import MessageRepository
from app.schemas.message import MessageOut, MessageListItem
 
 
def get_messages(
    db: Session,
    current_user_id: int,
    conversation_id: int,
    limit: int = 50,
    offset: int = 0,
) -> list[MessageListItem]:
    """
    Return message history for a conversation.
    Raises 404 if conversation not found or user is not a participant.
    """
    convo = ConversationRepository.get_by_id(db, conversation_id)
    if convo is None or current_user_id not in (convo.user_id1, convo.user_id2):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied.",
        )
 
    messages = MessageRepository.list_by_conversation(db, conversation_id, limit, offset)
    return [
        MessageListItem(
            id=m.id,
            sender_id=m.sender_id,
            message_text=m.message_text,
            created_at=m.created_at,
        )
        for m in messages
    ]
 
 
def send_message(
    db: Session,
    current_user_id: int,
    conversation_id: int,
    content: str,
) -> MessageOut:
    """
    Send a message in a conversation.
    Raises 404 if conversation not found or user is not a participant.
    """
    convo = ConversationRepository.get_by_id(db, conversation_id)
    if convo is None or current_user_id not in (convo.user_id1, convo.user_id2):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied.",
        )
 
    message = MessageRepository.create(db, conversation_id, current_user_id, content)
    return MessageOut(
        id=message.id,
        sender_id=message.sender_id,
        message_text=message.message_text,
        is_read=message.is_read,
        created_at=message.created_at,
    )
 
 
def delete_message(
    db: Session,
    current_user_id: int,
    message_id: int,
) -> None:
    """
    Delete a message.
    Raises 404 if message not found.
    Raises 403 if the user is not the sender.
    """
    message = MessageRepository.get_by_id(db, message_id)
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found.",
        )
    if message.sender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages.",
        )
 
    MessageRepository.delete(db, message_id)