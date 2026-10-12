"""Order / payment models."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, AuditMixin


class Order(Base, AuditMixin):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_no: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    # Product info
    package_type: Mapped[str] = mapped_column(String(32), nullable=False)
    # single / monthly / yearly
    package_name: Mapped[str] = mapped_column(String(64), nullable=False)

    # Payment
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    pay_method: Mapped[str | None] = mapped_column(String(32))
    # wechat / alipay / bank_card
    pay_status: Mapped[str] = mapped_column(String(16), default="pending")
    # pending / paid / failed / refunded

    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    external_order_no: Mapped[str | None] = mapped_column(String(128))
    remark: Mapped[str | None] = mapped_column(Text)
