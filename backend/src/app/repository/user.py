"""User repository.

This module provides data access layer for user operations.
"""

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    """Repository for user data access."""

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        """
        Get user by email.

        Args:
            db: Database session
            email: User email

        Returns:
            User | None: User if found, None otherwise
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        """
        Get user by ID.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            User | None: User if found, None otherwise
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(db: Session, user: UserCreate, hashed_password: str) -> User:
        """
        Create a new user.

        Args:
            db: Database session
            user: User creation data
            hashed_password: Hashed password from core/auth.py

        Returns:
            User: Created user
        """
        db_user = User(
            email=user.email,
            password_hash=hashed_password,  # matches User model column name
            first_name=user.first_name,
            last_name=user.last_name,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, db_user: User) -> User:
        """
        Update user.

        Note: The service layer is responsible for applying field changes
        to db_user before calling this method.

        Args:
            db: Database session
            db_user: User instance with updated fields already applied

        Returns:
            User: Updated user
        """
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def delete(db: Session, db_user: User) -> None:
        """
        Delete user.

        Args:
            db: Database session
            db_user: User instance to delete
        """
        db.delete(db_user)
        db.commit()