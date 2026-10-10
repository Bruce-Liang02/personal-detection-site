"""Credit & order API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.response import R
from app.models.user import User
from app.schemas.credit import CreditAccountOut, CreditTransactionOut, OrderOut, RechargeIn
from app.services import credit_service

router = APIRouter(prefix="/credits", tags=["积分"])


@router.get("/account")
async def get_account(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    acc = await credit_service.get_account(db, user.id)
    return R.ok(CreditAccountOut.model_validate(acc).dict())


@router.get("/transactions")
async def list_transactions(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await credit_service.list_transactions(db, user.id, page, page_size)
    return R.ok({
        "total": data["total"],
        "page": data["page"],
        "page_size": data["page_size"],
        "items": [CreditTransactionOut.model_validate(t).dict() for t in data["items"]],
    })


@router.get("/packages")
async def list_packages():
    return R.ok(credit_service.PACKAGES)


@router.post("/recharge")
async def create_recharge(
    data: RechargeIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        order = await credit_service.create_order(db, user.id, data.package_type, data.pay_method)
        return R.ok(OrderOut.model_validate(order).dict())
    except ValueError as e:
        return R.fail(str(e))


@router.post("/orders/{order_id}/pay")
async def simulate_pay(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Simulate payment (for development; replace with real payment in production)."""
    try:
        order = await credit_service.simulate_payment(db, order_id, user.id)
        return R.ok(OrderOut.model_validate(order).dict())
    except ValueError as e:
        return R.fail(str(e))
