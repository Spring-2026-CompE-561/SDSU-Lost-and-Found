# backend/src/app/schemas/items.py
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

ReportType = Literal["lost", "found"]


class SuccessResponse(BaseModel):
    success: bool = True


class ItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    location: str = Field(min_length=1, max_length=255)
    report_type: ReportType
    image_url: str | None = None
    given_back: bool = False


class ItemUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1)
    location: str | None = Field(None, min_length=1, max_length=255)
    report_type: ReportType | None = None
    image_url: str | None = None
    given_back: bool | None = None


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    location: str
    report_type: ReportType
    image_url: str | None
    given_back: bool
    created_at: datetime


class ItemListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    location: str
    report_type: ReportType
    image_url: str | None
    given_back: bool
    created_at: datetime

class PaginatedItemsResponse(BaseModel):
    items: list[ItemListItem]
    page: int
    page_size: int
    total: int
    total_pages: int