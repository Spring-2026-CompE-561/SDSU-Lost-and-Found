# backend/src/app/schemas/conversation.py
#from datetime import datetime
from pydantic import BaseModel



# Input Schema
#To create a new conversation
class ConversationCreate(BaseModel):
    recipient_id: int
    item_id: int | None = None

# Response Schema
class ConversationOut(BaseModel):
    id: int
    participant_ids: list[int]
    item_id: int | None = None
    #created_at: datetime

    model_config = {"from_attributes": True}


class ConversationListItem(BaseModel):
    id: int
    partner_id: int
    partner_name: str
    last_message: str | None = None
    item_id: int | None = None
    item_title: str | None = None

    model_config = {"from_attributes": True}


class SuccessResponse(BaseModel):
    success: bool = True
