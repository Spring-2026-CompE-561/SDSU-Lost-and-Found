"""
NOTE: Current_user_id = 1 is still hardcoded everywhere
"""
from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.conversation import (
    ConversationCreate,
    ConversationListItem,
    ConversationOut,
    SuccessResponse,
)
from app.schemas.message import MessageCreate, MessageOut, MessageListItem
import app.services.conversation as conversation_service
import app.services.chat_service as chat_service


api_router = APIRouter(prefix="/conversations", tags=["conversations"])

DB = Annotated[Session, Depends(get_db)]

# POST /conversations/
@api_router.post("/", response_model=ConversationOut)       # response schema 
def create_conversation(body: ConversationCreate, db: DB):  # input schema
    """Create or find a conversation between two users."""
    current_user_id = 1
    return conversation_service.get_or_create_conversation(db, current_user_id, body.current_user_id)


# GET /conversations/
@api_router.get("/", response_model=list[ConversationListItem])
def list_conversations(db: DB, limit: int = Query(50, ge=1), offset: int = Query(0, ge=0)):
    """List all active conversations for the logged-in user."""
    current_user_id = 1
    return conversation_service.list_conversations(db, current_user_id, limit, offset)


# DELETE /conversations/{conversation_id}
@api_router.delete("/{conversation_id}", response_model=SuccessResponse)
def delete_conversation(conversation_id: int, db: DB):
    """Delete a conversation and all its messages."""
    current_user_id = 1
    conversation_service.delete_conversation(db, current_user_id, conversation_id)
    return SuccessResponse()


#--------- Routes for Messages ----------#
@api_router.get("/{conversation_id}/messages", response_model=list[MessageListItem])
def get_messages(
    conversation_id: int,
    db: DB,
    limit: int = Query(50, ge=1),
    offset: int = Query(0, ge=0),
):
    """Retrieve message history for a conversation."""
    current_user_id = 1
    return chat_service.get_messages(db, current_user_id, conversation_id, limit, offset)
 
 
# POST /conversations/{conversation_id}/messages
@api_router.post("/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: int,
    body: MessageCreate,
    db: DB,
):
    """Send a new message in a conversation."""
    current_user_id = 1
    return chat_service.send_message(db, current_user_id, conversation_id, body.content)