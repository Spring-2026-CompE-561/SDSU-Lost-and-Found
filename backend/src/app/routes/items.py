
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.items import (
    ItemCreate,
    ItemListItem,
    ItemOut,
    ItemStatusUpdate,
    SuccessResponse,
)
import app.services.items as item_service

api_router = APIRouter(prefix="/home", tags=["items"])

DB = Annotated[Session, Depends(get_db)]


# GET /home
@api_router.get("/", response_model=list[ItemListItem])
def list_items(
    db: DB,
    limit: int = Query(50, ge=1),
    offset: int = Query(0, ge=0),
):
    """List item posts in the database."""
    return item_service.list_items(db, limit, offset)


# GET /home/{item_id}
@api_router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: DB):
    """Retrieve a specific item post."""
    return item_service.get_item_by_id(db, item_id)


# POST /home
@api_router.post("/", response_model=ItemOut)
def create_item(body: ItemCreate, db: DB):
    """Create a lost/found item post."""
    current_user_id = 1
    return item_service.create_item(db, body, current_user_id)


# PUT /home/{item_id}
@api_router.put("/{item_id}", response_model=SuccessResponse)
def update_item_status(item_id: int, body: ItemStatusUpdate, db: DB):
    """Update item returned status."""
    current_user_id = 1
    item_service.update_item_status(db, current_user_id, item_id, body)
    return SuccessResponse()


# DELETE /home/{item_id}
@api_router.delete("/{item_id}", response_model=SuccessResponse)
def delete_item(item_id: int, db: DB):
    """Delete an item post."""
    current_user_id = 1
    item_service.delete_item(db, current_user_id, item_id)
    return SuccessResponse()