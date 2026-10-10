"""Authentication request / response schemas."""
from __future__ import annotations

from pydantic import BaseModel, Field


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6, max_length=128)
    phone: str | None = Field(default=None, max_length=20)
    nickname: str | None = Field(default=None, max_length=64)
    referral_code: str | None = Field(default=None, max_length=16)


class LoginIn(BaseModel):
    username: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    nickname: str


class RefreshIn(BaseModel):
    refresh_token: str


class RefreshOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordResetIn(BaseModel):
    username: str
    old_password: str
    new_password: str = Field(min_length=6, max_length=128)
