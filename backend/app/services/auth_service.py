"""Authentication service."""
from __future__ import annotations

import secrets
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.models.user import User
from app.schemas.auth import LoginIn, LoginOut, RegisterIn


async def register(db: AsyncSession, data: RegisterIn) -> User:
    """Create a new user account."""
    # Check uniqueness:
    # - 用户名始终参与唯一性校验
    # - 手机号仅在用户提供时才校验，否则 User.phone == None 会被 SQLAlchemy
    #   转成 IS NULL，误匹配所有未绑手机号的账号。
    clauses = [User.username == data.username]
    if data.phone:
        clauses.append(User.phone == data.phone)

    exists = await db.execute(
        select(User).where(or_(*clauses))
    )
    if exists.scalar_one_or_none():
        raise ValueError("用户名或手机号已存在")

    # Generate referral code
    referral_code = secrets.token_hex(4).upper()

    user = User(
        username=data.username,
        phone=data.phone,
        nickname=data.nickname or data.username,
        password_hash=hash_password(data.password),
        referral_code=referral_code,
    )

    # Handle referral
    if data.referral_code:
        inviter = await db.execute(
            select(User).where(User.referral_code == data.referral_code)
        )
        inviter_user = inviter.scalar_one_or_none()
        if inviter_user:
            user.referred_by = inviter_user.id

    db.add(user)
    await db.flush()

    # Create referral record if applicable
    if user.referred_by:
        from app.models.referral import Referral
        db.add(Referral(
            inviter_id=user.referred_by,
            invitee_id=user.id,
            status="active",
        ))

    await db.commit()
    await db.refresh(user)
    return user


async def login(db: AsyncSession, data: LoginIn) -> LoginOut:
    """Authenticate user and return tokens."""
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise ValueError("用户名或密码错误")
    if not user.is_active:
        raise ValueError("账号已禁用")

    from datetime import datetime, timezone
    user.last_login_at = datetime.now(timezone.utc)

    tokens = LoginOut(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id,
        username=user.username,
        nickname=user.nickname,
    )
    await db.commit()
    return tokens


async def refresh_token(db: AsyncSession, refresh_token: str) -> str:
    """Issue a new access token from a valid refresh token."""
    from app.core.security import decode_token, create_access_token
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise ValueError("无效的刷新Token")

    user_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise ValueError("用户不存在或已禁用")

    return create_access_token(user.id)
