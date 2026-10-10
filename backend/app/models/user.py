"""User account model."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, AuditMixin


class User(Base, AuditMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(128), unique=True)
    nickname: Mapped[str] = mapped_column(String(64), default="")
    password_hash: Mapped[str] = mapped_column("password", String(128), nullable=False)
    avatar: Mapped[str | None] = mapped_column(String(256))
    bio: Mapped[str | None] = mapped_column(Text)

    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String(16), default="user")  # user | admin

    # Referral
    referral_code: Mapped[str | None] = mapped_column(String(16), unique=True, index=True)
    referred_by: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Preferences
    notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    email_notification: Mapped[bool] = mapped_column(Boolean, default=False)

    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"
