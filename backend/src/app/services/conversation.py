"""
Conversation Service
Business logic for conversations.
"""

#Becuase I need to wait for Messages to work Lines 12, 71, 75 are commented 

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repository.conversation_repository import ConversationRepository
from app.repository.item_repository import ItemRepository
from app.repository.message_repository import MessageRepository
from app.repository.user import UserRepository
from app.schemas.conversation import ConversationListItem, ConversationOut

def get_or_create_conversation(
    db: Session,
    current_user_id: int,
    recipient_id: int,
    item_id: int | None = None,
) -> ConversationOut:
    """
    Get existing conversation between two users or create a new one.

    The optional ``item_id`` is recorded only when a new conversation is created;
    existing conversations keep their original item context.
    """
    if current_user_id == recipient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot start a conversation with yourself.",
        )

    convo = ConversationRepository.get_by_user_pair(db, current_user_id, recipient_id)
    if not convo:
        convo = ConversationRepository.create(
            db, current_user_id, recipient_id, item_id
        )

    return ConversationOut(
        id=convo.id,
        participant_ids=[convo.user_id1, convo.user_id2],
        item_id=convo.item_id,
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
        partner = UserRepository.get_by_id(db, partner_id)
        last = MessageRepository.get_last_message_for_conversation(db, convo.id)

        if partner:
            partner_name = f"{partner.first_name} {partner.last_name}".strip()
        else:
            partner_name = "Unknown User"

        item_title: str | None = None
        if convo.item_id is not None:
            item = ItemRepository.get_by_id(db, convo.item_id)
            if item is not None:
                item_title = item.title

        result.append(
            ConversationListItem(
                id=convo.id,
                partner_id=partner_id,
                partner_name=partner_name,
                last_message=last.message_text if last else None,
                item_id=convo.item_id,
                item_title=item_title,
            )
        )

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