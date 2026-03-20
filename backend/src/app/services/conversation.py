"""
Conversation Service
Business logic for conversations.
"""

#Becuase I need to wait for Messages to work Lines 12, 71, 75 are commented 

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repository.conversation_repository import ConversationRepository
#from app.repository.message_repository import MessageRepository
from app.schemas.conversation import ConversationListItem, ConversationOut


def get_or_create_conversation(
    db: Session,
    current_user_id: int,
    recipient_id: int,
) -> ConversationOut:
    """
    Get existing conversation between two users or create a new one.

    Args:
        db: Database session
        current_user_id: ID of the logged-in user
        recipient_id: ID of the user to start a conversation with

    Returns:
        ConversationOut: The existing or newly created conversation
    """
    if current_user_id == recipient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot start a conversation with yourself.",
        )

    convo = ConversationRepository.get_by_user_pair(db, current_user_id, recipient_id)
    if not convo:
        convo = ConversationRepository.create(db, current_user_id, recipient_id)

    return ConversationOut(
        id=convo.id,
        participant_ids=[convo.user_id1, convo.user_id2],
        #created_at=convo.created_at,
    )


def list_conversations(
    db: Session,
    current_user_id: int,
    limit: int = 50,
    offset: int = 0,
) -> list[ConversationListItem]:
    """
    List all conversations for the logged-in user.

    Args:
        db: Database session
        current_user_id: ID of the logged-in user
        limit: Max number of results
        offset: Pagination offset

    Returns:
        list[ConversationListItem]: List of conversations with preview info
    """
    convos = ConversationRepository.list_for_user(db, current_user_id, limit, offset)
    result = []
    for convo in convos:
        partner_id = convo.user_id2 if convo.user_id1 == current_user_id else convo.user_id1
        #last = MessageRepository.get_last_message(db, convo.id)                                Until Messages are working
        result.append(ConversationListItem(
            id=convo.id,
            partner_id=partner_id,
            #last_message=last.message_text if last else None,
            last_message=None,                                                              #temporary until message backend works
            #created_at=convo.created_at,
        ))
    return result


def delete_conversation(
    db: Session,
    current_user_id: int,
    conversation_id: int,
) -> None:
    """
    Delete a conversation if the user is a participant.

    Args:
        db: Database session
        current_user_id: ID of the logged-in user
        conversation_id: ID of the conversation to delete
    """
    convo = ConversationRepository.get_by_id(db, conversation_id)
    if convo is None or current_user_id not in (convo.user_id1, convo.user_id2):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied.",
        )
    ConversationRepository.delete(db, convo)