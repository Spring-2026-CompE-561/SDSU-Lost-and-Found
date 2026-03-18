from fastapi import APIRouter, HTTPException, Query
from app.schemas.conversation import (
    ConversationCreate,
    ConversationOut,
    ConversationListItem,
    SuccessResponse
)
from app.schemas.message import MessageCreate, MessageOut, MessageListItem
from app.services import chat_service

api_router = APIRouter(prefix="/conversations", tags=["conversations"])

'''
NOTE: current_user_id = 1 is used as a placeholder name since right now
we do not have the real auth flow connected in this file yet, so it's fake the logged-in user as user 1.
'''
# create or find conversation between 2 users 
@api_router.post("/")
def create_conversation(payload: ConversationCreate) -> ConversationOut:
    try:
        return chat_service.get_or_create_conversation(
            current_user_id=1,
            recipient_id=payload.recipient_id,
        )
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Not implemented yet")
    
@api_router.get("/")
def list_conversations(
    limit: int = Query(50, ge = 1),
    offset: int = Query(0, ge= 0),
) -> list[ConversationListItem]:
    try: 
        return chat_service.list_conversations(
            current_user_id=1,
            limit=limit,
            offset=offset
        )
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Not implemented yet")

@api_router.delete("/")
def delete_conversation(conversation_id: int) -> SuccessResponse:
    try:
        return chat_service.delete_conversation(
            current_user_id=1,
            conversation_id=conversation_id,
        )
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Not implemented yet")
    
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