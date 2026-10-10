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
from app.models.credit import CreditAccount, CreditTransaction


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
    # Check credit balance
    account = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user_id)
    )
    acc = account.scalar_one_or_none()
    if not acc or acc.balance < 1:
        raise ValueError("检测次数不足，请先充值")

    # Freeze 1 credit
    acc.balance -= 1
    acc.frozen += 1

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

    # Record transaction
    txn = CreditTransaction(
        user_id=user_id,
        account_id=acc.id,
        amount=-1,
        type="consume",
        reference=f"task-{task.id}",
        description=f"检测任务 #{task.id} 提交",
        balance_after=acc.balance,
    )
    db.add(txn)
    await db.commit()
    await db.refresh(task)

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

    # Unfreeze credit
    account = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == task.user_id)
    )
    acc = account.scalar_one_or_none()
    if acc:
        acc.frozen = max(0, acc.frozen - 1)

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
