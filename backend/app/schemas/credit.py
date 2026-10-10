"""Credit & order schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class CreditAccountOut(BaseModel):
    balance: int
    total_recharged: int
    total_consumed: int
    frozen: int

    model_config = {"from_attributes": True}


class CreditTransactionOut(BaseModel):
    id: int
    amount: int
    type: str
    reference: str | None
    description: str | None
    balance_after: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RechargeIn(BaseModel):
    package_type: str  # single / monthly / yearly
    credit_amount: int
    pay_method: str | None = None


class OrderOut(BaseModel):
    id: int
    order_no: str
    package_type: str
    package_name: str
    credit_amount: int
    amount: float
    pay_method: str | None
    pay_status: str
    paid_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
