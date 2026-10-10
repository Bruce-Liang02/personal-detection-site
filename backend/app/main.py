"""FastAPI application entry point."""
from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables (dev only). Shutdown: cleanup."""
    from app.db.session import init_db
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5183", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount API v1 routers
from app.api.v1 import auth, user, detection, credits  # noqa: E402

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(user.router, prefix=settings.api_prefix)
app.include_router(detection.router, prefix=settings.api_prefix)
app.include_router(credits.router, prefix=settings.api_prefix)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.app_version}
