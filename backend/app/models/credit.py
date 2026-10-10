"""Credit account & transaction models."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, AuditMixin


class CreditAccount(Base, AuditMixin):
    __tablename__ = "credit_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    balance: Mapped[int] = mapped_column(Integer, default=0)  # 剩余检测次数
    total_recharged: Mapped[int] = mapped_column(Integer, default=0)  # 累计充值
    total_consumed: Mapped[int] = mapped_column(Integer, default=0)  # 累计消耗
    frozen: Mapped[int] = mapped_column(Integer, default=0)  # 冻结次数（检测进行中）


class CreditTransaction(Base, AuditMixin):
    __tablename__ = "credit_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    account_id: Mapped[int] = mapped_column(Integer, nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # 正数=充值，负数=消耗
    type: Mapped[str] = mapped_column(String(32), nullable=False)  # recharge / consume / refund / gift
    reference: Mapped[str | None] = mapped_column(String(128))  # 关联订单号或检测任务ID
    description: Mapped[str | None] = mapped_column(String(256))
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
