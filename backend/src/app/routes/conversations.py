"""
Conversation routes.

These routes use the logged-in user's JWT token to determine current_user_id.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.db import get_db
from app.schemas.conversation import (
    ConversationCreate,
    ConversationListItem,
    ConversationOut,
    ConversationStartCreate,
    ConversationStartResponse,
    SuccessResponse,
)
from app.schemas.message import MessageCreate, MessageOut, MessageListItem
import app.services.conversation as conversation_service
import app.services.chat_service as chat_service


api_router = APIRouter(prefix="/conversations", tags=["conversations"])

DB = Annotated[Session, Depends(get_db)]
CurrentUserId = Annotated[int, Depends(get_current_user_id)]


# POST /conversations/
@api_router.post("/", response_model=ConversationOut)
def create_conversation(
    body: ConversationCreate,
    db: DB,
    current_user_id: CurrentUserId,
):
    """Create or find a conversation between the logged-in user and another user."""
    return conversation_service.get_or_create_conversation(
        db,
        current_user_id,
        body.recipient_id,
        body.item_id,
    )

# POST /conversations/start
@api_router.post("/start", response_model=ConversationStartResponse)
def start_conversation_with_message(
    body: ConversationStartCreate,
    db: DB,
    current_user_id: CurrentUserId,
):
    """
    Create or reuse a conversation and send the first message.

    This is the preferred frontend flow because it prevents empty conversations.
    """
    return conversation_service.start_conversation_with_message(
        db,
        current_user_id,
        body.recipient_id,
        body.item_id,
        body.content,
    )
# GET /conversations/
@api_router.get("/", response_model=list[ConversationListItem])
def list_conversations(
    db: DB,
    current_user_id: CurrentUserId,
    limit: int = Query(50, ge=1),
    offset: int = Query(0, ge=0),
):
    """List all active conversations for the logged-in user."""
    return conversation_service.list_conversations(
        db,
        current_user_id,
        limit,
        offset,
    )


# DELETE /conversations/{conversation_id}
@api_router.delete("/{conversation_id}", response_model=SuccessResponse)
def delete_conversation(
    conversation_id: int,
    db: DB,
    current_user_id: CurrentUserId,
):
    """Delete a conversation if the logged-in user is a participant."""
    conversation_service.delete_conversation(
        db,
        current_user_id,
        conversation_id,
    )
    return SuccessResponse()


# GET /conversations/{conversation_id}/messages
@api_router.get("/{conversation_id}/messages", response_model=list[MessageListItem])
def get_messages(
    conversation_id: int,
    db: DB,
    current_user_id: CurrentUserId,
    limit: int = Query(50, ge=1),
    offset: int = Query(0, ge=0),
):
    """Retrieve message history for a conversation."""
    return chat_service.get_messages(
        db,
        current_user_id,
        conversation_id,
        limit,
        offset,
    )


# POST /conversations/{conversation_id}/messages
@api_router.post("/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: int,
    body: MessageCreate,
    db: DB,
    current_user_id: CurrentUserId,
):
    """Send a new message in a conversation."""
    return chat_service.send_message(
        db,
        current_user_id,
        conversation_id,
        body.content,
    )