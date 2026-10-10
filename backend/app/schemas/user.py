"""User-related schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    username: str
    phone: str | None
    email: str | None
    nickname: str
    avatar: str | None
    bio: str | None
    referral_code: str | None
    notification_enabled: bool
    email_notification: bool
    created_at: datetime
    last_login_at: datetime | None

    model_config = {"from_attributes": True}


class UserUpdateIn(BaseModel):
    nickname: str | None = None
    email: str | None = None
    avatar: str | None = None
    bio: str | None = None
    phone: str | None = None
    notification_enabled: bool | None = None
    email_notification: bool | None = None
