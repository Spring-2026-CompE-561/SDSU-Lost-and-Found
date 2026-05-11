# app/routes/user.py
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.token import TokenPairResponse
from app.schemas.user import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    ResetPasswordRequest,
    SignupResponse,
    SuccessResponse,
    User,
    UserCreate,
    UserUpdate,
    UserUpdateResponse,
)
from app.services.token_service import TokenService
from app.services.user import UserService
from app.core.auth import get_current_user_id

api_router = APIRouter(prefix="/user", tags=["users"])

DB = Annotated[Session, Depends(get_db)]
CurrentUserId = Annotated[int, Depends(get_current_user_id)]

# POST /user/signup
@api_router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(body: UserCreate, db: DB):
    """Register a new user account."""
    user = UserService.signup(db, body)
    return SignupResponse(userId=user.id)


# POST /user/login
@api_router.post("/login", response_model=TokenPairResponse)
def login(body: LoginRequest, db: DB):
    """
    Authenticate with email and password.
    Returns a short-lived access token (15 min) and a
    long-lived refresh token (7 days).
    """
    _, user_id = UserService.login(db, body.email, body.password)
    return TokenService.issue_token_pair(db, user_id)


# POST /user/forgot-password
@api_router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(body: ForgotPasswordRequest, db: DB):
    """
    Generate a password-reset token for the given SDSU email.
    Returns the token directly (demo mode — production would email it).
    """
    reset_token = UserService.forgot_password(db, body.email)
    return ForgotPasswordResponse(
        reset_token=reset_token,
        message="Reset token generated. Use it within 30 minutes.",
    )


# POST /user/reset-password
@api_router.post("/reset-password", response_model=SuccessResponse)
def reset_password(body: ResetPasswordRequest, db: DB):
    """Consume a password-reset token and set a new password."""
    UserService.reset_password(db, body.token, body.new_password)
    return SuccessResponse()

# DELETE /user/me
@api_router.delete("/me", response_model=SuccessResponse)
def delete_current_user(db: DB, current_user_id: CurrentUserId):
    """Delete the currently authenticated user's account."""
    UserService.delete_user(db, current_user_id)
    return SuccessResponse()

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