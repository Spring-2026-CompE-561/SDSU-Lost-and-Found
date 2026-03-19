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
from app.services.conversation_service import ConversationService

api_router = APIRouter(prefix="/conversations", tags=["conversations"])

DB = Annotated[Session, Depends(get_db)]

# POST /conversations/
@api_router.post("/", response_model=ConversationOut)       # response schema 
def create_conversation(body: ConversationCreate, db: DB):  # input schema
    """Create or find a conversation between two users."""
    current_user_id = 1
    return ConversationService.get_or_create_conversation(db, body, current_user_id)


# GET /conversations/
@api_router.get("/", response_model=list[ConversationListItem])
def list_conversations(db: DB, limit: int = Query(50, ge=1), offset: int = Query(0, ge=0)):
    """List all active conversations for the logged-in user."""
    current_user_id = 1
    return ConversationService.list_conversations(db, current_user_id, limit, offset)


# DELETE /conversations/{conversation_id}
@api_router.delete("/{conversation_id}", response_model=SuccessResponse)
def delete_conversation(conversation_id: int, db: DB):
    """Delete a conversation and all its messages."""
    current_user_id = 1
    ConversationService.delete_conversation(db, current_user_id, conversation_id)
    return SuccessResponse()





#--------- Routes for Messages ----------#
""""
@api_router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    limit: int = Query(50, ge=1),
    offset: int = Query(0, ge=0),
) -> list[MessageListItem]:
    try:
        return chat_service.get_messages(
            current_user_id=1,
            conversation_id=conversation_id,
            limit=limit,
            offset=offset,
        )
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Not implemented yet")


@api_router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    payload: MessageCreate,
) -> MessageOut:
    try:
        return chat_service.send_message(
            current_user_id=1,
            conversation_id=conversation_id,
            content=payload.content,
        )
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Not implemented yet")

        """