"""User schemas.

This module defines Pydantic schemas for user data validation and serialization.
"""

import re
from pydantic import BaseModel, EmailStr, Field, field_validator


#------------------Request Schemas-------------------
class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., min_length=8, max_length=20)
    first_name: str = Field(..., min_length=1, max_length=15)
    last_name: str = Field(..., min_length=1, max_length=15)

    @field_validator("password")
    @classmethod
    def password_must_be_valid(cls, password: str) -> str:
        """Validate password meets security requirements."""
        if len(password) < 8:
            msg = "Password must be at least 8 characters"
            raise ValueError(msg)
        if len(password) > 20:
            msg = "Password must be no more than 20 characters"
            raise ValueError(msg)
        if not re.search(r"[0-9]", password):
            msg = "Password must include at least 1 number"
            raise ValueError(msg)
        if not re.search(r"[a-zA-Z]", password):
            msg = "Password must include at least 1 letter"
            raise ValueError(msg)
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            msg = "Password must include at least 1 special character"
            raise ValueError(msg)
        return password

    @field_validator("first_name", "last_name")
    @classmethod
    def name_must_not_be_blank(cls, name: str) -> str:
        if not name.strip():
            msg = "Name cannot be blank"
            raise ValueError(msg)
        return name.strip()


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    first_name: str | None = Field(None, min_length=1, max_length=15)
    last_name: str | None = Field(None, min_length=1, max_length=15)

    @field_validator("first_name", "last_name")
    @classmethod
    def name_must_not_be_blank(cls, name: str | None) -> str | None:
        if name is not None and not name.strip():
            msg = "Name cannot be blank"
            raise ValueError(msg)
        return name.strip() if name else None

class LoginRequest(UserBase):
    """Schema for login request."""

    password: str

#-------------------Response Schemas----------------------
class User(UserBase):
    """Schema for user response."""

    id: int
    first_name: str
    last_name: str
    model_config = {"from_attributes": True}


class Token(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str

class SignupResponse(BaseModel):
    """Schema for signup response."""

    userId: int


class LoginResponse(BaseModel):
    """Schema for login response."""

    token: str
    userId: int


class UserUpdateResponse(BaseModel):
    """Schema for update user response."""

    success: bool = True
    user: User


class SuccessResponse(BaseModel):
    """Schema for generic success response."""

    success: bool = True