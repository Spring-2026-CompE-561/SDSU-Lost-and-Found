# backend/src/app/schemas/conversation.py
from datetime import datetime
from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    recipient_id: int = Field(..., ge=1)


class ConversationOut(BaseModel):
    id: int
    participant_ids: list[int]
    created_at: datetime


class ConversationListItem(BaseModel):
    id: int
    last_message: str | None = None
    partner_name: str | None = None


class SuccessResponse(BaseModel):
    success: bool = True
