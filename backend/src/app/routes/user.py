from fastapi import APIRouter, status

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
from app.models.user import User

api_router = APIRouter(prefix="/user", tags=["users"])


# POST /signup
@api_router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(body: UserCreate):
    """Register a new user account."""
    # TODO: check for duplicate email in DB
    # TODO: hash password and save user to DB
    return SignupResponse(userId=1)


# POST /login
@api_router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    """Authenticate and return a JWT access token."""
    # TODO: verify email and password against DB
    # TODO: generate and return real JWT token
    return LoginResponse(token="placeholder-token", userId=1)


# GET /user/{id}
@api_router.get("/user/{id}", response_model=User)
def get_user(id: int):
    """Retrieve a user's public profile."""
    # TODO: query DB for user by id, raise 404 if not found
    return User(id=id, first_name="John", last_name="Doe", email="john@example.com")


# PUT /user/{id}
@api_router.put("/user/{id}", response_model=UserUpdateResponse)
def update_user(id: int, body: UserUpdate):
    """Update a user's first name, last name, and/or email."""
    # TODO: query DB for user by id, raise 404 if not found
    # TODO: check for email conflict, apply updates, save to DB
    return UserUpdateResponse(
        user=User(id=id, first_name="John", last_name="Doe", email="john@example.com")
    )


# DELETE /user/{id}
@api_router.delete("/user/{id}", response_model=SuccessResponse)
def delete_user(id: int):
    """Delete a user and all their associated data."""
    # TODO: query DB for user by id, raise 404 if not found
    # TODO: delete user from DB (cascade handles related records)
    return SuccessResponse()