# backend/src/app/routes/uploads.py
"""Upload endpoints.

POST /api/v1/uploads/image  — store an image and return a URL the client can save.
"""

import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.core.auth import get_current_user_id
from app.core.settings import settings

api_router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}


class UploadResponse(BaseModel):
    url: str


@api_router.post(
    "/image",
    response_model=UploadResponse,
    summary="Upload an image",
    description=(
        "Upload an image (JPEG, PNG, GIF, or WebP) up to 5 MB. "
        "Returns a URL path that can be stored as `image_url` on a post."
    ),
)
async def upload_image(
    _current_user_id: Annotated[int, Depends(get_current_user_id)],
    file: UploadFile = File(...),
) -> UploadResponse:
    extension = ALLOWED_MIME_TYPES.get(file.content_type or "")

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type. Use JPEG, PNG, GIF, or WebP.",
        )

    contents = await file.read()

    if len(contents) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is larger than the 5 MB limit.",
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    filename = f"{uuid.uuid4().hex}{extension}"
    target = UPLOAD_DIR / filename
    target.write_bytes(contents)

    return UploadResponse(url=f"/uploads/{filename}")
