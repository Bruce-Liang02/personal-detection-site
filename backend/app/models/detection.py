"""Detection task & report models."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, AuditMixin


class DetectionTask(Base, AuditMixin):
    __tablename__ = "detection_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    # pending → processing → completed / failed

    # Paper info
    paper_title: Mapped[str | None] = mapped_column(String(256))
    author_name: Mapped[str | None] = mapped_column(String(64))
    course_name: Mapped[str | None] = mapped_column(String(128))
    school_name: Mapped[str | None] = mapped_column(String(128))
    major_name: Mapped[str | None] = mapped_column(String(128))
    student_id: Mapped[str | None] = mapped_column(String(32))

    # File info
    file_name: Mapped[str] = mapped_column(String(256), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    word_count: Mapped[int] = mapped_column(Integer, default=0)

    # Progress tracking
    progress: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    current_layer: Mapped[str | None] = mapped_column(String(32))
    # L1_format / L2_integrity / L3_expression / L4_critical

    # Layer status
    l1_status: Mapped[str | None] = mapped_column(String(16))  # pending / running / done
    l2_status: Mapped[str | None] = mapped_column(String(16))
    l3_status: Mapped[str | None] = mapped_column(String(16))
    l4_status: Mapped[str | None] = mapped_column(String(16))

    # Results
    overall_score: Mapped[float | None] = mapped_column(Float)
    overall_grade: Mapped[str | None] = mapped_column(String(8))
    # A / B / C / D / R

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_msg: Mapped[str | None] = mapped_column(Text)

    # External adapter reference
    external_task_id: Mapped[str | None] = mapped_column(String(128))


class DetectionReport(Base, AuditMixin):
    __tablename__ = "detection_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    # Report number (display)
    report_number: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    # Scores & grades
    overall_score: Mapped[float | None] = mapped_column(Float)
    overall_grade: Mapped[str | None] = mapped_column(String(8))

    # Layer scores
    l1_score: Mapped[float | None] = mapped_column(Float)
    l1_grade: Mapped[str | None] = mapped_column(String(8))
    l2_score: Mapped[float | None] = mapped_column(Float)
    l2_grade: Mapped[str | None] = mapped_column(String(8))
    l3_score: Mapped[float | None] = mapped_column(Float)
    l3_grade: Mapped[str | None] = mapped_column(String(8))
    l4_score: Mapped[float | None] = mapped_column(Float)
    l4_grade: Mapped[str | None] = mapped_column(String(8))

    # Key metrics
    similarity_rate: Mapped[float | None] = mapped_column(Float)
    aigc_rate: Mapped[float | None] = mapped_column(Float)
    issue_count_risk: Mapped[int] = mapped_column(Integer, default=0)  # 需改进
    issue_count_warn: Mapped[int] = mapped_column(Integer, default=0)  # 需关注
    issue_count_good: Mapped[int] = mapped_column(Integer, default=0)  # 达标

    # Full report detail (JSON text)
    detail: Mapped[str | None] = mapped_column(Text)

    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
