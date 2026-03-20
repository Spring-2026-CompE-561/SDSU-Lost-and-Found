# backend/src/app/schemas/conversation.py
#from datetime import datetime
from pydantic import BaseModel



# Input Schema
#To create a new conversation 
class ConversationCreate(BaseModel):
    recipient_id: int 

# Response Schema
class ConversationOut(BaseModel):
    id: int
    participant_ids: list[int]
    #created_at: datetime

    model_config = {"from_attributes": True}


class ConversationListItem(BaseModel):
    id: int
    partner_id: int
    last_message: str | None = None

    model_config = {"from_attributes": True}


class SuccessResponse(BaseModel):
    success: bool = True
