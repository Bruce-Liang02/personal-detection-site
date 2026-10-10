"""Credit account service."""
from __future__ import annotations

from datetime import datetime, timezone
import secrets

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit import CreditAccount, CreditTransaction
from app.models.order import Order


async def get_account(db: AsyncSession, user_id: int) -> CreditAccount | None:
    result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user_id)
    )
    acc = result.scalar_one_or_none()
    if acc is None:
        acc = CreditAccount(user_id=user_id, balance=1, total_recharged=1)
        db.add(acc)
        await db.commit()
        await db.refresh(acc)
    return acc


async def list_transactions(
    db: AsyncSession, user_id: int, page: int = 1, page_size: int = 20
) -> dict:
    offset = (page - 1) * page_size
    total = (await db.execute(
        select(func.count(CreditTransaction.id)).where(CreditTransaction.user_id == user_id)
    )).scalar() or 0

    results = (await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == user_id)
        .order_by(CreditTransaction.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )).scalars().all()

    return {"total": total, "page": page, "page_size": page_size, "items": results}


# Package pricing
PACKAGES = {
    "single": {"name": "单次检测", "credits": 1, "price": 29.9},
    "pack_5": {"name": "5次检测包", "credits": 5, "price": 119.9},
    "pack_10": {"name": "10次检测包", "credits": 10, "price": 199.9},
    "monthly": {"name": "月度会员", "credits": 10, "price": 99.9},
    "yearly": {"name": "年度会员", "credits": 50, "price": 399.9},
}


async def create_order(
    db: AsyncSession,
    user_id: int,
    package_type: str,
    pay_method: str | None = None,
) -> Order:
    if package_type not in PACKAGES:
        raise ValueError(f"未知的套餐类型: {package_type}")

    pkg = PACKAGES[package_type]
    order_no = f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(4).upper()}"

    order = Order(
        order_no=order_no,
        user_id=user_id,
        package_type=package_type,
        package_name=pkg["name"],
        credit_amount=pkg["credits"],
        amount=pkg["price"],
        pay_method=pay_method,
        pay_status="pending",
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


async def simulate_payment(db: AsyncSession, order_id: int, user_id: int) -> Order:
    """Simulate payment completion (for development)."""
    order = await db.get(Order, order_id)
    if not order or order.user_id != user_id:
        raise ValueError("订单不存在")
    if order.pay_status != "pending":
        raise ValueError("订单状态异常")

    order.pay_status = "paid"
    order.paid_at = datetime.now(timezone.utc)

    # Credit the account
    acc = await get_account(db, user_id)
    acc.balance += order.credit_amount
    acc.total_recharged += order.credit_amount

    txn = CreditTransaction(
        user_id=user_id,
        account_id=acc.id,
        amount=order.credit_amount,
        type="recharge",
        reference=order.order_no,
        description=f"充值套餐「{order.package_name}」",
        balance_after=acc.balance,
    )
    db.add(txn)
    await db.commit()
    await db.refresh(order)
    return order
