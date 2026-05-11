from datetime import datetime, timedelta

from sqlalchemy import or_
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
    def _build_filtered_query(
        db: Session,
        search: str | None = None,
        report_type: str | None = None,
        location: str | None = None,
        date_range: str | None = None,
        active_only: bool = True,
    ):
        query = db.query(Item)

        # Home feed should show active items by default.
        # Returned items stay visible in /my-posts, but not in the public feed.
        if active_only:
            query = query.filter(Item.given_back.is_(False))

        if report_type:
            query = query.filter(Item.report_type == report_type)

        if search:
            search_value = search.strip()

            if search_value:
                search_pattern = f"%{search_value}%"

                query = query.filter(
                    or_(
                        Item.title.ilike(search_pattern),
                        Item.description.ilike(search_pattern),
                        Item.location.ilike(search_pattern),
                    )
                )

        if location:
            location_value = location.strip()

            if location_value:
                location_pattern = f"%{location_value}%"
                query = query.filter(Item.location.ilike(location_pattern))

        if date_range:
            now = datetime.utcnow()
            start_date = None

            if date_range == "today":
                start_date = datetime(now.year, now.month, now.day)
            elif date_range == "7":
                start_date = now - timedelta(days=7)
            elif date_range == "30":
                start_date = now - timedelta(days=30)

            if start_date is not None:
                query = query.filter(Item.created_at >= start_date)

        return query
    @staticmethod
    def list_filtered(
        db: Session,
        limit: int = 50,
        offset: int = 0,
        search: str | None = None,
        report_type: str | None = None,
        location: str | None = None,
        date_range: str | None = None,
        active_only: bool = True,
    ):
        query = ItemRepository._build_filtered_query(
            db=db,
            search=search,
            report_type=report_type,
            location=location,
            date_range=date_range,
            active_only=active_only,
        )

        return (
            query.order_by(Item.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
    @staticmethod
    def count_filtered(
        db: Session,
        search: str | None = None,
        report_type: str | None = None,
        location: str | None = None,
        date_range: str | None = None,
        active_only: bool = True,
    ) -> int:
        query = ItemRepository._build_filtered_query(
            db=db,
            search=search,
            report_type=report_type,
            location=location,
            date_range=date_range,
            active_only=active_only,
        )

        return query.count()
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
        report_type: str,
        image_url: str | None = None,
        given_back: bool = False,
    ) -> Item:
        item = Item(
            user_id=user_id,
            title=title,
            description=description,
            location=location,
            report_type=report_type,
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
        report_type: str | None = None,
        image_url: str | None = None,
        given_back: bool | None = None,
    ) -> Item:
        if title is not None:
            db_item.title = title
        if description is not None:
            db_item.description = description
        if location is not None:
            db_item.location = location
        if report_type is not None:
            db_item.report_type = report_type
        if image_url is not None:
            db_item.image_url = image_url
        if given_back is not None:
            db_item.given_back = given_back

        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def update_fields(db: Session, db_item: Item, fields: dict) -> Item:
        for field_name, field_value in fields.items():
            setattr(db_item, field_name, field_value)

        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def delete(db: Session, db_item: Item) -> None:
        db.delete(db_item)
        db.commit()