"""Unit tests for app/services/items.py — item CRUD service functions."""

import pytest
from fastapi import HTTPException

from app.schemas.items import ItemCreate, ItemUpdate
from app.schemas.user import UserCreate
from app.services import items as item_service
from app.services.user import UserService

_ITEM = ItemCreate(
    title="Lost Backpack",
    description="Black Jansport found near the library",
    location="Love Library",
    report_type="lost",
)


def _make_user(db, email: str = "owner@sdsu.edu"):
    return UserService.signup(db, UserCreate(
        first_name="Owner", last_name="User",
        email=email, password="TestPass1!",
    ))


# ---------------------------------------------------------------------------
# create_item
# ---------------------------------------------------------------------------

def test_create_item_returns_item(db):
    user = _make_user(db)
    result = item_service.create_item(db, _ITEM, user.id)
    assert result.id is not None
    assert result.title == "Lost Backpack"
    assert result.user_id == user.id
    assert result.report_type == "lost"


def test_create_item_with_image_url(db):
    user = _make_user(db)
    item = ItemCreate(
        title="Found Keys",
        description="Car keys",
        location="Parking Lot A",
        report_type="found",
        image_url="http://example.com/keys.jpg",
    )
    result = item_service.create_item(db, item, user.id)
    assert result.image_url == "http://example.com/keys.jpg"


# ---------------------------------------------------------------------------
# get_item_by_id
# ---------------------------------------------------------------------------

def test_get_item_by_id_found(db):
    user = _make_user(db)
    created = item_service.create_item(db, _ITEM, user.id)
    found = item_service.get_item_by_id(db, created.id)
    assert found.id == created.id


def test_get_item_by_id_not_found_raises_404(db):
    with pytest.raises(HTTPException) as exc_info:
        item_service.get_item_by_id(db, 99999)
    assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# list_items
# ---------------------------------------------------------------------------

def test_list_items_empty_db(db):
    result = item_service.list_items(db, limit=10, offset=0)
    assert result == []


def test_list_items_returns_created_items(db):
    user = _make_user(db)
    item_service.create_item(db, _ITEM, user.id)
    result = item_service.list_items(db, limit=10, offset=0)
    assert len(result) == 1


def test_list_items_active_only_excludes_returned(db):
    user = _make_user(db)
    given_back = ItemCreate(
        title="Returned Item", description="desc",
        location="loc", report_type="found", given_back=True,
    )
    item_service.create_item(db, given_back, user.id)
    result = item_service.list_items(db, limit=10, offset=0, active_only=True)
    assert len(result) == 0


def test_list_items_active_only_false_includes_all(db):
    user = _make_user(db)
    given_back = ItemCreate(
        title="Returned Item", description="desc",
        location="loc", report_type="found", given_back=True,
    )
    item_service.create_item(db, given_back, user.id)
    result = item_service.list_items(db, limit=10, offset=0, active_only=False)
    assert len(result) == 1


# ---------------------------------------------------------------------------
# list_items_for_user
# ---------------------------------------------------------------------------

def test_list_items_for_user_returns_only_own(db):
    user_a = _make_user(db, "a@sdsu.edu")
    user_b = _make_user(db, "b@sdsu.edu")
    item_service.create_item(db, _ITEM, user_a.id)
    item_service.create_item(db, _ITEM, user_b.id)

    result_a = item_service.list_items_for_user(db, user_a.id, limit=10, offset=0)
    assert len(result_a) == 1
    assert result_a[0].user_id == user_a.id


# ---------------------------------------------------------------------------
# update_item
# ---------------------------------------------------------------------------

def test_update_item_title(db):
    user = _make_user(db)
    item = item_service.create_item(db, _ITEM, user.id)
    updated = item_service.update_item(db, user.id, item.id, ItemUpdate(title="New Title"))
    assert updated.title == "New Title"


def test_update_item_mark_given_back(db):
    user = _make_user(db)
    item = item_service.create_item(db, _ITEM, user.id)
    updated = item_service.update_item(db, user.id, item.id, ItemUpdate(given_back=True))
    assert updated.given_back is True


def test_update_item_not_found_raises_404(db):
    user = _make_user(db)
    with pytest.raises(HTTPException) as exc_info:
        item_service.update_item(db, user.id, 99999, ItemUpdate(title="X"))
    assert exc_info.value.status_code == 404


def test_update_item_wrong_owner_raises_403(db):
    owner = _make_user(db, "owner@sdsu.edu")
    other = _make_user(db, "other@sdsu.edu")
    item = item_service.create_item(db, _ITEM, owner.id)
    with pytest.raises(HTTPException) as exc_info:
        item_service.update_item(db, other.id, item.id, ItemUpdate(title="X"))
    assert exc_info.value.status_code == 403


def test_update_item_no_fields_raises_400(db):
    user = _make_user(db)
    item = item_service.create_item(db, _ITEM, user.id)
    with pytest.raises(HTTPException) as exc_info:
        item_service.update_item(db, user.id, item.id, ItemUpdate())
    assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# delete_item
# ---------------------------------------------------------------------------

def test_delete_item_removes_it(db):
    user = _make_user(db)
    item = item_service.create_item(db, _ITEM, user.id)
    item_service.delete_item(db, user.id, item.id)
    with pytest.raises(HTTPException):
        item_service.get_item_by_id(db, item.id)


def test_delete_item_not_found_raises_404(db):
    user = _make_user(db)
    with pytest.raises(HTTPException) as exc_info:
        item_service.delete_item(db, user.id, 99999)
    assert exc_info.value.status_code == 404


def test_delete_item_wrong_owner_raises_403(db):
    owner = _make_user(db, "owner@sdsu.edu")
    other = _make_user(db, "other@sdsu.edu")
    item = item_service.create_item(db, _ITEM, owner.id)
    with pytest.raises(HTTPException) as exc_info:
        item_service.delete_item(db, other.id, item.id)
    assert exc_info.value.status_code == 403
