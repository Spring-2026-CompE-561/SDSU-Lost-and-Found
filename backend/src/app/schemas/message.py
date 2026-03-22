# backend/src/app/schemas/message.py
from datetime import datetime
from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class MessageOut(BaseModel):
    id: int
    sender_id: int
    message_text: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageListItem(BaseModel):
    id: int
    sender_id: int
    message_text: str
    created_at: datetime

    model_config = {"from_attributes": True}