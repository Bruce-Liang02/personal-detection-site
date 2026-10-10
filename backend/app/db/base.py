"""SQLAlchemy async session factory and Base model."""
from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import DateTime, func, BigInteger
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class AuditMixin:
    """Auto-managed timestamps for created / updated."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
