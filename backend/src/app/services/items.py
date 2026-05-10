from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repository.item_repository import ItemRepository
from math import ceil
from app.schemas.items import ItemCreate, ItemUpdate, PaginatedItemsResponse

def list_items(
    db: Session,
    limit: int,
    offset: int,
    search: str | None = None,
    report_type: str | None = None,
    location: str | None = None,
    date_range: str | None = None,
    active_only: bool = True,
):
    return ItemRepository.list_filtered(
        db=db,
        limit=limit,
        offset=offset,
        search=search,
        report_type=report_type,
        location=location,
        date_range=date_range,
        active_only=active_only,
    )

def list_items_paginated(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    report_type: str | None = None,
    location: str | None = None,
    date_range: str | None = None,
    active_only: bool = True,
) -> PaginatedItemsResponse:
    offset = (page - 1) * page_size

    items = ItemRepository.list_filtered(
        db=db,
        limit=page_size,
        offset=offset,
        search=search,
        report_type=report_type,
        location=location,
        date_range=date_range,
        active_only=active_only,
    )

    total = ItemRepository.count_filtered(
        db=db,
        search=search,
        report_type=report_type,
        location=location,
        date_range=date_range,
        active_only=active_only,
    )

    total_pages = max(1, ceil(total / page_size)) if page_size else 1

    return PaginatedItemsResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )
def list_items_for_user(db: Session, current_user_id: int, limit: int, offset: int):
    return ItemRepository.list_for_user(db, current_user_id, limit, offset)

def get_item_by_id(db: Session, item_id: int):
    item = ItemRepository.get_by_id(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    return item


def create_item(db: Session, body: ItemCreate, current_user_id: int):
    return ItemRepository.create(
        db=db,
        user_id=current_user_id,
        title=body.title,
        description=body.description,
        location=body.location,
        report_type=body.report_type,
        image_url=body.image_url,
        given_back=body.given_back,
    )


def update_item(
    db: Session,
    current_user_id: int,
    item_id: int,
    body: ItemUpdate,
):
    item = ItemRepository.get_by_id(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this item",
        )

    update_data = body.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update fields were provided",
        )

    return ItemRepository.update_fields(db, item, update_data)


def delete_item(db: Session, current_user_id: int, item_id: int):
    item = ItemRepository.get_by_id(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this item",
        )

    ItemRepository.delete(db, item)