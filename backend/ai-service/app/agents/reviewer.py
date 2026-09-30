"""
reviewer.py — The resume review agent.

Splits the work by what each side is good at:
  - the score and its breakdown come from the deterministic rubric, so the
    number is reproducible and every point is explainable;
  - the strengths, issues and suggestions come from the LLM, which is good at
    reading prose and bad at arithmetic.

If the model fails to return usable JSON twice, the review still returns with
the rubric findings rather than an error — a scored breakdown alone is useful.
"""
import json
import re

from app.log import log
from app.prompts.reviewer import (
    JSON_RETRY_CORRECTION,
    REVIEWER_SYSTEM_PROMPT,
    build_review_prompt,
)
from app.schemas.resume_schema import Resume
from app.services.llm_service import complete, model_name
from app.services.rubric import score_resume

_MARKDOWN_FENCE = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.IGNORECASE)


class EmptyResumeError(ValueError):
    """Raised when there is not enough resume to review."""


def _extract_json(text: str) -> dict | None:
    """Pull a JSON object out of a reply that may be fenced or padded with prose."""
    if not text:
        return None

    cleaned = _MARKDOWN_FENCE.sub("", text.strip())

    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        pass

    # Fall back to the outermost {...} span.
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end <= start:
        return None

    try:
        parsed = json.loads(cleaned[start:end + 1])
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def _clean_items(value, limit: int) -> list[str]:
    """Coerce whatever the model put in a list into clean one-line strings."""
    if not isinstance(value, list):
        return []

    items = []
    for entry in value:
        if not isinstance(entry, str):
            continue
        text = re.sub(r"^\s*[•\-*]\s*", "", entry).replace("*", "").strip()
        text = " ".join(text.split())
        if text:
            items.append(text)

    return items[:limit]


def _fallback_from_breakdown(breakdown: list[dict]) -> tuple[list[str], list[str]]:
    """Derive strengths and issues from the rubric when the model gives nothing."""
    strengths = [row["detail"] for row in breakdown if row["score"] == row["max"]]
    issues = [row["detail"] for row in breakdown if row["score"] < row["max"] * 0.5]
    return strengths[:4], issues[:5]


def review_resume(resume: Resume) -> dict:
    """Score the resume and describe what to fix."""
    if not resume.has_content():
        raise EmptyResumeError(
            "Fill in some of your resume first — there is nothing to review yet."
        )

    total, breakdown = score_resume(resume)

    user_prompt = build_review_prompt(resume, total, breakdown)
    parsed = _extract_json(complete(REVIEWER_SYSTEM_PROMPT, user_prompt))

    if parsed is None:
        log("[reviewer] first reply was not valid JSON; retrying")
        parsed = _extract_json(complete(REVIEWER_SYSTEM_PROMPT, user_prompt + JSON_RETRY_CORRECTION))

    strengths = _clean_items((parsed or {}).get("strengths"), 4)
    issues = _clean_items((parsed or {}).get("issues"), 5)
    suggestions = _clean_items((parsed or {}).get("suggestions"), 5)

    # The rubric alone is still a useful review, so degrade rather than fail.
    if not strengths and not issues:
        log("[reviewer] model produced no usable findings; falling back to the rubric")
        strengths, issues = _fallback_from_breakdown(breakdown)

    return {
        "score": total,
        "breakdown": breakdown,
        "strengths": strengths,
        "issues": issues,
        "suggestions": suggestions,
        "model": model_name(),
    }
