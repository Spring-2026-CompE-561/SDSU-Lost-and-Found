"""User service.

This module provides business logic for user operations.
"""

from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.repository.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service for user business logic."""

    @staticmethod
    def signup(db: Session, body: UserCreate) -> User:
        """
        Register a new user.

        Args:
            db: Database session
            body: User creation data

        Returns:
            User: Newly created user

        Raises:
            HTTPException 400: If email is already registered
        """
        existing = UserRepository.get_by_email(db, body.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with that email already exists.",
            )

        hashed_password = get_password_hash(body.password)
        return UserRepository.create(db, body, hashed_password)

    @staticmethod
    def login(db: Session, email: str, password: str) -> tuple[str, int]:
        """
        Authenticate a user and return a JWT token.

        Args:
            db: Database session
            email: User email
            password: Plain text password

        Returns:
            tuple[str, int]: JWT token and user ID

        Raises:
            HTTPException 401: If credentials are invalid
        """
        user = UserRepository.get_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

        token = create_access_token(
            data={"sub": str(user.id), "scope": "user"},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return token, user.id

    @staticmethod
    def get_user(db: Session, user_id: int) -> User:
        """
        Retrieve a user by ID.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            User: Found user

        Raises:
            HTTPException 404: If user is not found
        """
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user

    @staticmethod
    def update_user(db: Session, user_id: int, body: UserUpdate) -> User:
        """
        Update a user's profile.

        Args:
            db: Database session
            user_id: User ID
            body: Fields to update

        Returns:
            User: Updated user

        Raises:
            HTTPException 404: If user is not found
            HTTPException 400: If new email is already in use
        """
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if body.email and body.email != user.email:
            conflict = UserRepository.get_by_email(db, body.email)
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="That email is already in use.",
                )
            user.email = body.email

        if body.first_name is not None:
            user.first_name = body.first_name
        if body.last_name is not None:
            user.last_name = body.last_name

        return UserRepository.update(db, user)

    @staticmethod
    def delete_user(db: Session, user_id: int) -> None:
        """
        Delete a user by ID.

        Args:
            db: Database session
            user_id: User ID

        Raises:
            HTTPException 404: If user is not found
        """
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        UserRepository.delete(db, user)