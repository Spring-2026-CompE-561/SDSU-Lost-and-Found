# src/app/api/v1/routes.py
from fastapi import APIRouter

from app.routes.user import api_router as user_router
from app.routes.conversations import api_router as conversation_router
from app.routes.messages import api_router as message_router
from app.routes.token import api_router as token_router

# Central router that collects all sub-routers under /api/v1
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(user_router)
api_router.include_router(conversation_router)
api_router.include_router(message_router)
api_router.include_router(token_router)
