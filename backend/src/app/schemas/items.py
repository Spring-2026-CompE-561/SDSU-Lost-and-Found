# backend/src/app/schemas/items.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SuccessResponse(BaseModel):
    success: bool = True


class ItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    location: str = Field(min_length=1, max_length=255)
    image_url: str | None = None
    given_back: bool = False


class ItemStatusUpdate(BaseModel):
    given_back: bool


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    location: str
    image_url: str | None
    given_back: bool
    created_at: datetime


class ItemListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    location: str
    image_url: str | None
    given_back: bool
    created_at: datetime