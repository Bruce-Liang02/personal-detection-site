"""Detection adapter interface and mock implementation.

The adapter pattern allows swapping the real VPCS detection service
with a mock for development and testing.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import random
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class DetectionProgress:
    """Real-time progress of a detection task."""
    layer: str  # L1_format / L2_integrity / L3_expression / L4_critical
    progress: int  # 0-100


@dataclass
class DetectionResult:
    """Complete detection result returned by the adapter."""
    overall_score: float
    overall_grade: str  # A / B / C / D / R
    l1_score: float
    l1_grade: str
    l2_score: float
    l2_grade: str
    l3_score: float
    l3_grade: str
    l4_score: float
    l4_grade: str
    similarity_rate: float
    aigc_rate: float
    issue_count_risk: int
    issue_count_warn: int
    issue_count_good: int
    detail: dict = field(default_factory=dict)


class DetectionAdapter(ABC):
    """Abstract interface for paper detection."""

    @abstractmethod
    async def submit(self, task_id: int, file_path: str) -> str:
        """Submit a file for detection. Returns external task ID."""
        ...

    @abstractmethod
    async def check_progress(self, external_task_id: str) -> DetectionProgress | None:
        """Poll current progress. Returns None if no update."""
        ...

    @abstractmethod
    async def fetch_result(self, external_task_id: str) -> DetectionResult:
        """Fetch the final result. Called when progress reaches 100%."""
        ...

    @abstractmethod
    async def cancel(self, external_task_id: str) -> None:
        """Cancel a running detection task."""
        ...


class MockDetectionAdapter(DetectionAdapter):
    """Deterministic mock adapter for development.

    Generates reproducible pseudo-random results based on task_id hash,
    with a simulated 15-second detection delay.
    """

    LAYER_NAMES = ["L1_format", "L2_integrity", "L3_expression", "L4_critical"]
    _progress_store: dict[str, DetectionProgress] = {}
    _result_store: dict[str, DetectionResult] = {}

    async def submit(self, task_id: int, file_path: str) -> str:
        ext_id = hashlib.sha256(f"task-{task_id}-{time.time()}".encode()).hexdigest()[:16]
        # Schedule background "detection"
        asyncio.create_task(self._simulate(ext_id, task_id))
        return ext_id

    async def check_progress(self, external_task_id: str) -> DetectionProgress | None:
        return self._progress_store.get(external_task_id)

    async def fetch_result(self, external_task_id: str) -> DetectionResult:
        if external_task_id not in self._result_store:
            raise RuntimeError(f"Result not ready: {external_task_id}")
        return self._result_store[external_task_id]

    async def cancel(self, external_task_id: str) -> None:
        self._progress_store.pop(external_task_id, None)

    # ── Private helpers ────────────────────────────────────

    async def _simulate(self, ext_id: str, task_id: int) -> None:
        """Simulate a 15-second detection with layer-by-layer progress."""
        seed = int(hashlib.sha256(f"{task_id}".encode()).hexdigest(), 16)
        rng = random.Random(seed)

        for layer in self.LAYER_NAMES:
            for pct in range(0, 101, 5):
                self._progress_store[ext_id] = DetectionProgress(layer=layer, progress=pct)
                await asyncio.sleep(0.3)  # ~0.3s per layer → ~6s total

        # Generate deterministic results
        self._result_store[ext_id] = self._generate_result(rng)
        self._progress_store.pop(ext_id, None)

    def _generate_result(self, rng: random.Random) -> DetectionResult:
        similarity = round(rng.uniform(5, 60), 2)
        aigc = round(rng.uniform(5, 90), 2)
        l1 = round(rng.uniform(40, 95), 2)
        l2 = round(rng.uniform(40, 95), 2)
        l3 = round(rng.uniform(50, 95), 2)
        l4 = round(rng.uniform(40, 90), 2)
        overall = round((l1 + l2 + l3 + l4) / 4, 2)

        def grade(score: float) -> str:
            if score >= 85:
                return "A"
            if score >= 70:
                return "B"
            if score >= 55:
                return "C"
            if score >= 40:
                return "D"
            return "R"

        risk = rng.randint(0, 12)
        warn = rng.randint(0, 8)
        good = rng.randint(3, 15)

        detail = {
            "layers": {
                "L1": {
                    "name": "学术规范",
                    "score": l1,
                    "grade": grade(l1),
                    "sub_dims": {
                        "1.1 论文结构要素": {"status": "good" if rng.random() > 0.3 else "risk", "issues": []},
                        "1.2 标题层级": {"status": "good" if rng.random() > 0.4 else "warn", "issues": []},
                        "1.3 编号体系": {"status": "good" if rng.random() > 0.5 else "warn", "issues": []},
                        "1.4 字号字体": {"status": "risk" if rng.random() > 0.7 else "good", "issues": []},
                        "1.5 段落间距": {"status": "good" if rng.random() > 0.4 else "warn", "issues": []},
                        "1.6 图表格式": {"status": "good" if rng.random() > 0.5 else "risk", "issues": []},
                        "1.7 引用标注": {"status": "good", "issues": []},
                        "1.8 参考文献格式": {"status": "warn" if rng.random() > 0.6 else "good", "issues": []},
                    },
                },
                "L2": {
                    "name": "学术诚信",
                    "score": l2,
                    "grade": grade(l2),
                    "sub_dims": {
                        "2.1 文本相似度": {"status": "risk" if similarity > 30 else ("warn" if similarity > 15 else "good"),
                                           "similarity": similarity},
                        "2.2 AIGC疑似率": {"status": "risk" if aigc > 70 else ("warn" if aigc > 30 else "good"),
                                           "aigc_rate": aigc},
                        "2.3 疑似虚假参考文献": {"status": "good" if rng.random() > 0.5 else "warn", "issues": []},
                    },
                },
                "L3": {
                    "name": "学术表达",
                    "score": l3,
                    "grade": grade(l3),
                    "sub_dims": {
                        "3.1 学术语言规范": {"status": "good" if rng.random() > 0.4 else "warn",
                                             "problems": rng.randint(0, 5)},
                    },
                },
                "L4": {
                    "name": "批判性思维",
                    "score": l4,
                    "grade": grade(l4),
                    "sub_dims": {
                        "4.1 逻辑一致性": {"status": "good" if rng.random() > 0.4 else "warn",
                                           "rating": rng.randint(2, 5)},
                        "4.2 论证严密性": {"status": "good" if rng.random() > 0.5 else "warn",
                                           "rating": rng.randint(2, 5)},
                        "4.3 结论综合分析": {"status": "good" if rng.random() > 0.4 else "warn",
                                             "rating": rng.randint(2, 5)},
                        "4.4 结构表达清晰度": {"status": "good" if rng.random() > 0.3 else "warn",
                                               "rating": rng.randint(2, 5)},
                    },
                },
            },
            "overall": overall,
            "overall_grade": grade(overall),
            "summary": f"本报告综合评分{overall}分，等级{grade(overall)}。"
                       f"文本相似度{similarity}%，AIGC疑似率{aigc}%。"
                       f"共发现{risk}项需改进、{warn}项需关注、{good}项达标。",
        }

        return DetectionResult(
            overall_score=overall,
            overall_grade=grade(overall),
            l1_score=l1, l1_grade=grade(l1),
            l2_score=l2, l2_grade=grade(l2),
            l3_score=l3, l3_grade=grade(l3),
            l4_score=l4, l4_grade=grade(l4),
            similarity_rate=similarity,
            aigc_rate=aigc,
            issue_count_risk=risk,
            issue_count_warn=warn,
            issue_count_good=good,
            detail=detail,
        )


_ADAPTERS: dict[str, type[DetectionAdapter]] = {
    "mock": MockDetectionAdapter,
}


def get_adapter(name: str | None = None) -> DetectionAdapter:
    cls = _ADAPTERS.get(name or "mock", MockDetectionAdapter)
    return cls()
