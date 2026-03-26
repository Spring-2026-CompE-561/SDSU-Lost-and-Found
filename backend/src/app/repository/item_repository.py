from sqlalchemy.orm import Session

from app.models.items import Item


class ItemRepository:
    @staticmethod
    def get_by_id(db: Session, item_id: int) -> Item | None:
        return db.query(Item).filter(Item.id == item_id).first()

    @staticmethod
    def list_all(db: Session, limit: int = 50, offset: int = 0):
        return (
            db.query(Item)
            .order_by(Item.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def list_for_user(db: Session, user_id: int, limit: int = 50, offset: int = 0):
        return (
            db.query(Item)
            .filter(Item.user_id == user_id)
            .order_by(Item.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        title: str,
        description: str,
        location: str,
        image_url: str | None = None,
        given_back: bool = False,
    ) -> Item:
        item = Item(
            user_id=user_id,
            title=title,
            description=description,
            location=location,
            image_url=image_url,
            given_back=given_back,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def update_status(db: Session, db_item: Item, given_back: bool) -> Item:
        db_item.given_back = given_back
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def update(
        db: Session,
        db_item: Item,
        title: str | None = None,
        description: str | None = None,
        location: str | None = None,
        image_url: str | None = None,
        given_back: bool | None = None,
    ) -> Item:
        if title is not None:
            db_item.title = title
        if description is not None:
            db_item.description = description
        if location is not None:
            db_item.location = location
        if image_url is not None:
            db_item.image_url = image_url
        if given_back is not None:
            db_item.given_back = given_back

        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def delete(db: Session, db_item: Item) -> None:
        db.delete(db_item)
        db.commit()