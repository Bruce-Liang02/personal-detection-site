"""Authentication API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.core.response import R
from app.schemas.auth import LoginIn, LoginOut, RegisterIn, RefreshIn, RefreshOut, PasswordResetIn
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register")
async def register(data: RegisterIn, db: AsyncSession = Depends(get_db)):
    try:
        user = await auth_service.register(db, data)
        return R.ok({"user_id": user.id, "username": user.username, "nickname": user.nickname}, "注册成功")
    except ValueError as e:
        return R.fail(str(e))


@router.post("/login")
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    try:
        tokens = await auth_service.login(db, data)
        return R.ok(tokens.dict())
    except ValueError as e:
        return R.fail(str(e))


@router.post("/refresh")
async def refresh(data: RefreshIn, db: AsyncSession = Depends(get_db)):
    try:
        token = await auth_service.refresh_token(db, data.refresh_token)
        return R.ok({"access_token": token, "token_type": "bearer"})
    except ValueError as e:
        return R.fail(str(e))


@router.post("/password-reset")
async def reset_password(data: PasswordResetIn, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.user import User
    from app.core.security import verify_password, hash_password

    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.old_password, user.password_hash):
        return R.fail("原密码错误")
    user.password_hash = hash_password(data.new_password)
    await db.commit()
    return R.ok(message="密码修改成功")
