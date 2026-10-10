"""Application configuration."""
from __future__ import annotations

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised settings read from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── App ──────────────────────────────────────────────
    app_name: str = "课程论文个人检测平台"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # ── Database (Oracle via oracledb) ───────────────────
    db_user: str = ""
    db_password: str = ""
    db_dsn: str = ""
    db_pool_min: int = 2
    db_pool_max: int = 10
    # Convenience: computed DSN string for SQLAlchemy
    @property
    def database_url(self) -> str:
        if self.db_dsn:
            return f"oracle+oracledb://{self.db_user}:{self.db_password}@{self.db_dsn}"
        return "sqlite+aiosqlite:///./detection.db"  # fallback for development

    # ─ JWT ──────────────────────────────────────────────
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 h
    refresh_token_expire_days: int = 30

    # ── File upload ──────────────────────────────────────
    upload_dir: str = "./uploads"
    max_upload_bytes: int = 50 * 1024 * 1024  # 50 MB
    allowed_extensions: str = ".doc,.docx,.pdf"

    # ── Detection adapter ────────────────────────────────
    detection_adapter: str = "mock"  # "mock" | "vpcs"

    # ── SMS / Email (optional) ───────────────────────────
    sms_enabled: bool = False
    email_enabled: bool = False

    # ── Frontend URL (for CORS & links) ──────────────────
    frontend_url: str = "http://localhost:5183"


settings = Settings()
