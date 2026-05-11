from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.db import get_db

from app.schemas.items import (
    ItemCreate,
    ItemListItem,
    ItemOut,
    ItemUpdate,
    PaginatedItemsResponse,
    ReportType,
    SuccessResponse,
)
import app.services.items as item_service

api_router = APIRouter(prefix="/home", tags=["items"])

DB = Annotated[Session, Depends(get_db)]
CurrentUserId = Annotated[int, Depends(get_current_user_id)]


# GET /home
@api_router.get("/", response_model=PaginatedItemsResponse)
def list_items(
    db: DB,
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=50),
    search: str | None = Query(None, min_length=1),
    report_type: ReportType | None = Query(None),
    location: str | None = Query(None, min_length=1),
    date_range: Literal["today", "7", "30"] | None = Query(None),
    active_only: bool = Query(True),
):
    """List item posts with optional search, filters, and pagination."""
    return item_service.list_items_paginated(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        report_type=report_type,
        location=location,
        date_range=date_range,
        active_only=active_only,
    )

# GET /home/my-posts
@api_router.get("/my-posts", response_model=list[ItemListItem])
def list_my_items(
    db: DB,
    current_user_id: CurrentUserId,
    limit: int = Query(50, ge=1),
    offset: int = Query(0, ge=0),
):
    """List item posts created by the logged-in user."""
    return item_service.list_items_for_user(db, current_user_id, limit, offset)

# GET /home/{item_id}
@api_router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: DB):
    """Retrieve a specific item post."""
    return item_service.get_item_by_id(db, item_id)


# POST /home
@api_router.post("/", response_model=ItemOut)
def create_item(
    body: ItemCreate,
    db: DB,
    current_user_id: CurrentUserId,
):
    """Create a lost/found item post."""
    return item_service.create_item(db, body, current_user_id)


# PUT /home/{item_id}
@api_router.put("/{item_id}", response_model=SuccessResponse)
def update_item(
    item_id: int,
    body: ItemUpdate,
    db: DB,
    current_user_id: CurrentUserId,
):
    """Update an item post if the logged-in user owns it."""
    item_service.update_item(db, current_user_id, item_id, body)
    return SuccessResponse()


# DELETE /home/{item_id}
@api_router.delete("/{item_id}", response_model=SuccessResponse)
def delete_item(
    item_id: int,
    db: DB,
    current_user_id: CurrentUserId,
):
    """Delete an item post."""
    item_service.delete_item(db, current_user_id, item_id)
    return SuccessResponse()