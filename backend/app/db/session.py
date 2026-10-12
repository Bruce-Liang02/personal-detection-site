"""Async SQLAlchemy engine + session factory."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=settings.db_pool_max,
    max_overflow=5,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Create tables (development only; production should use Alembic)."""
    from app.db.base import Base
    from app.models import user, detection, order, referral  # noqa: F401  – register models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
