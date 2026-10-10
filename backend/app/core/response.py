"""Unified API response envelope and exceptions."""
from __future__ import annotations

from typing import Any, Generic, TypeVar
from fastapi import HTTPException, status


T = TypeVar("T")


class R(Generic[T]):
    """Standard response wrapper: {code, message, data}."""

    def __init__(self, code: int = 0, message: str = "ok", data: Any = None) -> None:
        self.code = code
        self.message = message
        self.data = data

    def dict(self) -> dict:
        return {"code": self.code, "message": self.message, "data": self.data}

    @staticmethod
    def ok(data: Any = None, message: str = "ok") -> dict:
        return R(code=0, message=message, data=data).dict()

    @staticmethod
    def fail(message: str, code: int = -1) -> dict:
        return R(code=code, message=message).dict()


class BizError(HTTPException):
    """Business-logic error mapped to HTTP 200 with code != 0,
    or to a proper HTTP status for server-side issues."""

    def __init__(self, message: str, code: int = -1, http_status: int = 200) -> None:
        super().__init__(status_code=http_status, detail=message)
        self.biz_code = code
        self.biz_message = message
