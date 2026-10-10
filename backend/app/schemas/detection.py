"""Detection-related schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class DetectionSubmitIn(BaseModel):
    paper_title: str | None = Field(default=None, max_length=256)
    author_name: str | None = Field(default=None, max_length=64)
    course_name: str | None = Field(default=None, max_length=128)
    school_name: str | None = Field(default=None, max_length=128)
    major_name: str | None = Field(default=None, max_length=128)
    student_id: str | None = Field(default=None, max_length=32)


class DetectionTaskOut(BaseModel):
    id: int
    user_id: int
    status: str
    paper_title: str | None
    file_name: str
    progress: int
    current_layer: str | None
    l1_status: str | None
    l2_status: str | None
    l3_status: str | None
    l4_status: str | None
    overall_score: float | None
    overall_grade: str | None
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime
    word_count: int

    model_config = {"from_attributes": True}


class DetectionReportOut(BaseModel):
    id: int
    task_id: int
    report_number: str
    overall_score: float | None
    overall_grade: str | None
    l1_score: float | None
    l1_grade: str | None
    l2_score: float | None
    l2_grade: str | None
    l3_score: float | None
    l3_grade: str | None
    l4_score: float | None
    l4_grade: str | None
    similarity_rate: float | None
    aigc_rate: float | None
    issue_count_risk: int
    issue_count_warn: int
    issue_count_good: int
    detail: str | None
    generated_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DetectionReportListItem(BaseModel):
    id: int
    report_number: str
    paper_title: str | None
    file_name: str
    overall_score: float | None
    overall_grade: str | None
    similarity_rate: float | None
    aigc_rate: float | None
    issue_count_risk: int
    issue_count_warn: int
    issue_count_good: int
    status: str
    created_at: datetime
    finished_at: datetime | None
