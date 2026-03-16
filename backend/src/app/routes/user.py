# app/routes/users.py
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.user import (
    LoginRequest,
    LoginResponse,
    SignupResponse,
    SuccessResponse,
    User,
    UserCreate,
    UserUpdate,
    UserUpdateResponse,
)
from app.services.user import UserService

api_router = APIRouter(prefix="/user", tags=["users"])

DB = Annotated[Session, Depends(get_db)]


# POST /user/signup
@api_router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(body: UserCreate, db: DB):
    """Register a new user account."""
    user = UserService.signup(db, body)
    return SignupResponse(userId=user.id)


# POST /user/login
@api_router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: DB):
    """Authenticate and return a JWT access token."""
    token, user_id = UserService.login(db, body.email, body.password)
    return LoginResponse(token=token, userId=user_id)


# GET /user/{id}
@api_router.get("/{id}", response_model=User)
def get_user(id: int, db: DB):
    """Retrieve a user's public profile."""
    return UserService.get_user(db, id)


# PUT /user/{id}
@api_router.put("/{id}", response_model=UserUpdateResponse)
def update_user(id: int, body: UserUpdate, db: DB):
    """Update a user's first name, last name, and/or email."""
    user = UserService.update_user(db, id, body)
    return UserUpdateResponse(user=User.model_validate(user))


# DELETE /user/{id}
@api_router.delete("/{id}", response_model=SuccessResponse)
def delete_user(id: int, db: DB):
    """Delete a user and all their associated data."""
    UserService.delete_user(db, id)
    return SuccessResponse()