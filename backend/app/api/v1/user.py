"""User profile API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.response import R
from app.models.user import User
from app.schemas.user import UserOut, UserUpdateIn

router = APIRouter(prefix="/user", tags=["用户"])


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return R.ok(UserOut.model_validate(user).dict())


@router.put("/me")
async def update_me(
    data: UserUpdateIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return R.ok(UserOut.model_validate(user).dict())
