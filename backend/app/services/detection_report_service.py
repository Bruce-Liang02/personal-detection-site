"""Detection report service."""
from __future__ import annotations

import os
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.detection import DetectionTask, DetectionReport


ALLOWED_EXT = {".doc", ".docx", ".pdf"}


def _validate_upload(file: UploadFile) -> None:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise ValueError(f"不支持的文件格式，仅支持 {', '.join(ALLOWED_EXT)}")
    if file.size and file.size > settings.max_upload_bytes:
        raise ValueError(f"文件大小超出限制（最大 {settings.max_upload_bytes // 1024 // 1024}MB）")


async def upload_file(file: UploadFile, user_id: int) -> str:
    """Save uploaded file and return file path."""
    _validate_upload(file)
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1].lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(upload_dir, filename)
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    return path


async def submit_detection(
    db: AsyncSession,
    user_id: int,
    file_path: str,
    file_name: str,
    file_size: int,
    paper_info: dict,
) -> DetectionTask:
    """Create a detection task and start detection via adapter."""
    task = DetectionTask(
        user_id=user_id,
        status="pending",
        file_name=file_name,
        file_path=file_path,
        file_size=file_size,
        paper_title=paper_info.get("paper_title"),
        author_name=paper_info.get("author_name"),
        course_name=paper_info.get("course_name"),
        school_name=paper_info.get("school_name"),
        major_name=paper_info.get("major_name"),
        student_id=paper_info.get("student_id"),
    )
    db.add(task)
    await db.flush()

    # Start detection via adapter
    from app.detection.adapter import get_adapter
    adapter = get_adapter(settings.detection_adapter)
    ext_id = await adapter.submit(task.id, file_path)
    task.external_task_id = ext_id
    task.status = "processing"
    task.started_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    return task


async def get_task_progress(db: AsyncSession, task_id: int, user_id: int) -> DetectionTask | None:
    result = await db.execute(
        select(DetectionTask).where(DetectionTask.id == task_id, DetectionTask.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def poll_and_finalize(db: AsyncSession, task_id: int) -> DetectionReport | None:
    """Poll adapter for task completion and create report if done."""
    from app.detection.adapter import get_adapter
    adapter = get_adapter(settings.detection_adapter)

    task = await db.get(DetectionTask, task_id)
    if not task or not task.external_task_id:
        return None

    progress = await adapter.check_progress(task.external_task_id)
    if progress:
        task.current_layer = progress.layer
        task.progress = progress.progress
        # Update layer status
        layer_map = {
            "L1_format": "l1_status",
            "L2_integrity": "l2_status",
            "L3_expression": "l3_status",
            "L4_critical": "l4_status",
        }
        for layer_name, attr in layer_map.items():
            if layer_name == progress.layer:
                setattr(task, attr, "running")
            else:
                idx = ["L1_format", "L2_integrity", "L3_expression", "L4_critical"].index(layer_name)
                curr_idx = ["L1_format", "L2_integrity", "L3_expression", "L4_critical"].index(progress.layer)
                if idx < curr_idx:
                    setattr(task, attr, "done")
                elif idx > curr_idx:
                    setattr(task, attr, "pending")
        await db.commit()
        return None

    # Try to fetch result
    try:
        result = await adapter.fetch_result(task.external_task_id)
    except RuntimeError:
        return None

    # Generate report number
    report_number = secrets.token_hex(8)

    # Update task
    task.status = "completed"
    task.progress = 100
    task.finished_at = datetime.now(timezone.utc)
    task.overall_score = result.overall_score
    task.overall_grade = result.overall_grade
    task.l1_status = "done"
    task.l2_status = "done"
    task.l3_status = "done"
    task.l4_status = "done"
    task.current_layer = None

    # Create report
    report = DetectionReport(
        task_id=task.id,
        user_id=task.user_id,
        report_number=report_number,
        overall_score=result.overall_score,
        overall_grade=result.overall_grade,
        l1_score=result.l1_score,
        l1_grade=result.l1_grade,
        l2_score=result.l2_score,
        l2_grade=result.l2_grade,
        l3_score=result.l3_score,
        l3_grade=result.l3_grade,
        l4_score=result.l4_score,
        l4_grade=result.l4_grade,
        similarity_rate=result.similarity_rate,
        aigc_rate=result.aigc_rate,
        issue_count_risk=result.issue_count_risk,
        issue_count_warn=result.issue_count_warn,
        issue_count_good=result.issue_count_good,
        detail=str(result.detail) if result.detail else None,
        generated_at=datetime.now(timezone.utc),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def list_reports(db: AsyncSession, user_id: int, page: int = 1, page_size: int = 10) -> dict:
    """Paginated report list for the current user."""
    offset = (page - 1) * page_size
    total_q = select(func.count(DetectionReport.id)).where(DetectionReport.user_id == user_id)
    total = (await db.execute(total_q)).scalar() or 0

    query = (
        select(DetectionReport)
        .where(DetectionReport.user_id == user_id)
        .order_by(DetectionReport.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    results = (await db.execute(query)).scalars().all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": results,
    }


async def get_report(db: AsyncSession, report_id: int, user_id: int) -> DetectionReport | None:
    result = await db.execute(
        select(DetectionReport).where(
            DetectionReport.id == report_id,
            DetectionReport.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


# ── Report number format & detection types ──────────────────────────

# Report number: 4-digit hex type prefix + 16 hex chars (8 bytes random)
# Total: 20 hex characters
DETECTION_TYPE_MAP = {
    "0001": "查重检测",
    "0002": "格式检测",
    "0003": "AIGC检测",
    "0004": "智评检测",
}

REPORT_NUMBER_RE = __import__("re").compile(r"^[0-9a-fA-F]{20}$")


def parse_report_number(report_number: str) -> dict | None:
    """
    Parse a report number. Returns dict with detection_type info, or None if format invalid.
    Format: 4 hex chars (type prefix) + 16 hex chars (unique token)
    """
    report_number = report_number.strip()
    if not REPORT_NUMBER_RE.match(report_number):
        return None
    type_prefix = report_number[:4].upper()
    detection_type_label = DETECTION_TYPE_MAP.get(type_prefix, None)
    return {
        "report_number": report_number,
        "type_prefix": type_prefix,
        "detection_type": detection_type_label,
    }


async def verify_report(db: AsyncSession, report_number: str) -> dict | None:
    """
    Look up a report by its report_number (public, no auth).
    Returns dict with report + task info, or None if not found.
    """
    report_number = report_number.strip()
    result = await db.execute(
        select(DetectionReport)
        .join(DetectionTask, DetectionReport.task_id == DetectionTask.id)
        .where(DetectionReport.report_number == report_number)
    )
    report = result.scalar_one_or_none()
    if not report:
        return None

    task = await db.get(DetectionTask, report.task_id)

    detection_type_label = None
    if task:
        type_prefix = report_number[:4].upper()
        detection_type_label = DETECTION_TYPE_MAP.get(type_prefix)

    return {
        "report_number": report.report_number,
        "detection_type": detection_type_label or "未知",
        "paper_title": task.paper_title if task else None,
        "author_name": task.author_name if task else None,
        "overall_score": report.overall_score,
        "overall_grade": report.overall_grade,
        "l1_score": report.l1_score,
        "l1_grade": report.l1_grade,
        "l2_score": report.l2_score,
        "l2_grade": report.l2_grade,
        "l3_score": report.l3_score,
        "l3_grade": report.l3_grade,
        "l4_score": report.l4_score,
        "l4_grade": report.l4_grade,
        "similarity_rate": report.similarity_rate,
        "aigc_rate": report.aigc_rate,
        "generated_at": report.generated_at.isoformat() if report.generated_at else None,
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }
