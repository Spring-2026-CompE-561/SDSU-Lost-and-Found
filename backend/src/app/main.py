# src/app/main.py
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.api.v1.routes import api_router
from app.core.db import Base, engine
from app.core.settings import settings

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)


def _ensure_conversation_item_column() -> None:
    """Add nullable conversations.item_id to existing databases. Idempotent."""
    inspector = inspect(engine)
    if "conversations" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("conversations")}
    if "item_id" in existing:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE conversations ADD COLUMN item_id INTEGER"))


_ensure_conversation_item_column()

# Ensure the uploads directory exists before mounting it.
upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.app_name,
    description="A web application for reporting, searching, and recovering lost items on campus.",
    version=settings.app_version,
)

app.include_router(api_router)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
