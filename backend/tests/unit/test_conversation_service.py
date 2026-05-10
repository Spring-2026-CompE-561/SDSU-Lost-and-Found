"""Unit tests for conversation service messaging cleanup."""

import pytest
from fastapi import HTTPException

from app.repository.message_repository import MessageRepository
from app.schemas.items import ItemCreate
from app.schemas.user import UserCreate
from app.services import conversation as conversation_service
from app.services import items as item_service
from app.services.user import UserService


def _make_user(db, email: str, first_name: str = "Test"):
    return UserService.signup(
        db,
        UserCreate(
            first_name=first_name,
            last_name="User",
            email=email,
            password="TestPass1!",
        ),
    )


def _make_item(db, owner_id: int, title: str = "Found Hydro Flask"):
    return item_service.create_item(
        db,
        ItemCreate(
            title=title,
            description="Black bottle found near library",
            location="Love Library",
            report_type="found",
        ),
        owner_id,
    )


def test_start_conversation_with_message_creates_conversation_and_message(db):
    owner = _make_user(db, "owner@sdsu.edu", "Owner")
    sender = _make_user(db, "sender@sdsu.edu", "Sender")
    item = _make_item(db, owner.id)

    result = conversation_service.start_conversation_with_message(
        db,
        sender.id,
        owner.id,
        item.id,
        "Hi, I think this might be mine.",
    )

    assert result.conversation.id is not None
    assert result.conversation.item_id == item.id
    assert result.message.message_text == "Hi, I think this might be mine."
    assert result.message.sender_id == sender.id


def test_same_users_same_item_reuse_same_conversation(db):
    owner = _make_user(db, "owner@sdsu.edu", "Owner")
    sender = _make_user(db, "sender@sdsu.edu", "Sender")
    item = _make_item(db, owner.id)

    first = conversation_service.start_conversation_with_message(
        db,
        sender.id,
        owner.id,
        item.id,
        "First message",
    )

    second = conversation_service.start_conversation_with_message(
        db,
        sender.id,
        owner.id,
        item.id,
        "Second message",
    )

    assert first.conversation.id == second.conversation.id

    messages = MessageRepository.list_by_conversation(
        db,
        first.conversation.id,
        limit=10,
        offset=0,
    )
    assert len(messages) == 2


def test_same_users_different_items_create_different_conversations(db):
    owner = _make_user(db, "owner@sdsu.edu", "Owner")
    sender = _make_user(db, "sender@sdsu.edu", "Sender")
    item_one = _make_item(db, owner.id, "Found Hydro Flask")
    item_two = _make_item(db, owner.id, "Found Backpack")

    first = conversation_service.start_conversation_with_message(
        db,
        sender.id,
        owner.id,
        item_one.id,
        "Message about first item",
    )

    second = conversation_service.start_conversation_with_message(
        db,
        sender.id,
        owner.id,
        item_two.id,
        "Message about second item",
    )

    assert first.conversation.id != second.conversation.id
    assert first.conversation.item_id == item_one.id
    assert second.conversation.item_id == item_two.id


def test_user_cannot_message_self(db):
    owner = _make_user(db, "owner@sdsu.edu", "Owner")
    item = _make_item(db, owner.id)

    with pytest.raises(HTTPException) as exc_info:
        conversation_service.start_conversation_with_message(
            db,
            owner.id,
            owner.id,
            item.id,
            "Can I message myself?",
        )

    assert exc_info.value.status_code == 400


def test_empty_message_is_rejected(db):
    owner = _make_user(db, "owner@sdsu.edu", "Owner")
    sender = _make_user(db, "sender@sdsu.edu", "Sender")
    item = _make_item(db, owner.id)

    with pytest.raises(HTTPException) as exc_info:
        conversation_service.start_conversation_with_message(
            db,
            sender.id,
            owner.id,
            item.id,
            "   ",
        )

    assert exc_info.value.status_code == 400