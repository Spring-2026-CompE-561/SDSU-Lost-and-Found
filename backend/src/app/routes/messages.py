from fastapi import APIRouter, HTTPException

from app.schemas.conversation import SuccessResponse
from app.services import chat_service

api_router = APIRouter(prefix="/messages", tags=["messages"])


@api_router.delete("/{message_id}")
def delete_message(message_id: int) -> SuccessResponse:
    try:
        return chat_service.delete_message(
            current_user_id=1,
            message_id=message_id,
        )
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Not implemented yet")