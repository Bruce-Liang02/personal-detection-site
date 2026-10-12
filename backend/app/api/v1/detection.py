"""Detection API endpoints."""
from __future__ import annotations

import os

from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.response import R
from app.models.user import User
from app.schemas.detection import DetectionSubmitIn, DetectionTaskOut, DetectionReportOut, DetectionReportListItem
from app.services import detection_report_service

router = APIRouter(prefix="/detection", tags=["检测"])


class VerifyReportIn(BaseModel):
    report_number: str = Field(..., min_length=1, max_length=64)


@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    paper_title: str = Form(None),
    author_name: str = Form(None),
    course_name: str = Form(None),
    school_name: str = Form(None),
    major_name: str = Form(None),
    student_id: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        file_path = await detection_report_service.upload_file(file, user.id)
        file_size = os.path.getsize(file_path)

        paper_info = {
            "paper_title": paper_title,
            "author_name": author_name,
            "course_name": course_name,
            "school_name": school_name,
            "major_name": major_name,
            "student_id": student_id,
        }

        task = await detection_report_service.submit_detection(
            db, user.id, file_path, file.filename or "unknown", file_size, paper_info
        )
        return R.ok(DetectionTaskOut.model_validate(task).dict())
    except ValueError as e:
        return R.fail(str(e))


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = await detection_report_service.get_task_progress(db, task_id, user.id)
    if not task:
        return R.fail("检测任务不存在")
    return R.ok(DetectionTaskOut.model_validate(task).dict())


@router.post("/tasks/{task_id}/poll")
async def poll_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = await detection_report_service.get_task_progress(db, task_id, user.id)
    if not task:
        return R.fail("检测任务不存在")

    if task.status == "completed":
        return R.ok(DetectionTaskOut.model_validate(task).dict())

    if task.status == "failed":
        return R.fail(task.error_msg or "检测失败")

    report = await detection_report_service.poll_and_finalize(db, task_id)
    if report:
        # Reload task
        await db.refresh(task)
        return R.ok({
            "task": DetectionTaskOut.model_validate(task).dict(),
            "report": DetectionReportOut.model_validate(report).dict(),
            "completed": True,
        })

    await db.refresh(task)
    return R.ok({
        "task": DetectionTaskOut.model_validate(task).dict(),
        "completed": False,
    })


@router.get("/reports")
async def list_reports(
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await detection_report_service.list_reports(db, user.id, page, page_size)
    return R.ok({
        "total": data["total"],
        "page": data["page"],
        "page_size": data["page_size"],
        "items": [DetectionReportListItem.model_validate(r).dict() for r in data["items"]],
    })


@router.get("/reports/{report_id}")
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    report = await detection_report_service.get_report(db, report_id, user.id)
    if not report:
        return R.fail("报告不存在")
    return R.ok(DetectionReportOut.model_validate(report).dict())


@router.post("/verify")
async def verify_report(
    body: VerifyReportIn,
    db: AsyncSession = Depends(get_db),
):
    """Public report verification — no auth required."""
    parsed = detection_report_service.parse_report_number(body.report_number)
    if parsed is None:
        return R.fail("报告编号格式有误", code=1)

    result = await detection_report_service.verify_report(db, body.report_number)
    if result is None:
        return R.fail("未查询到报告", code=2)
    return R.ok(result)
