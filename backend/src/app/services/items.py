from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repository.item_repository import ItemRepository
from app.schemas.items import ItemCreate, ItemStatusUpdate


def list_items(db: Session, limit: int, offset: int):
    return ItemRepository.list_all(db, limit, offset)


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
        image_url=body.image_url,
        given_back=body.given_back,
    )


def update_item_status(
    db: Session,
    current_user_id: int,
    item_id: int,
    body: ItemStatusUpdate,
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

    return ItemRepository.update_status(db, item, body.given_back)


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