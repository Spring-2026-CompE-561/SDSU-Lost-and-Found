# backend/src/app/schemas/message.py
from datetime import datetime
from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class MessageOut(BaseModel):
    id: int
    sender_id: int
    content: str
    timestamp: datetime


class MessageListItem(BaseModel):
    id: int
    sender_id: int
    text: str
    timestamp: datetime