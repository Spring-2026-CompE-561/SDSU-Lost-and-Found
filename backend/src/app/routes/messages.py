# backend/src/app/routes/messages.py
from typing import Annotated
 
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
 
from app.core.db import get_db
from app.schemas.conversation import SuccessResponse
import app.services.chat_service as chat_service
 
api_router = APIRouter(prefix="/messages", tags=["messages"])
 
DB = Annotated[Session, Depends(get_db)]
 
 
# DELETE /messages/{message_id}
@api_router.delete("/{message_id}", response_model=SuccessResponse)
def delete_message(message_id: int, db: DB):
    """Delete a specific message."""
    current_user_id = 1
    chat_service.delete_message(db, current_user_id, message_id)
    return SuccessResponse()