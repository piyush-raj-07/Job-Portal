"""
resume_writer.py — The professional summary agent.

Prompting alone reduces fabrication but does not eliminate it, so the output
also passes a deterministic check for the failure mode that matters most here:
claiming years of professional experience the candidate does not have. On a
violation the agent retries once with an explicit correction, and if the model
still misbehaves the offending sentence is dropped rather than shown.
"""
import re

from app.config import SUMMARY_MAX_CHARS
from app.log import log
from app.prompts.resume_writer import (
    INVENTED_NUMBERS_CORRECTION,
    NO_EXPERIENCE_CORRECTION,
    PROJECT_SYSTEM_PROMPT,
    SUMMARY_SYSTEM_PROMPT,
    build_project_prompt,
    build_summary_prompt,
)
from app.schemas.resume_schema import Project, Resume
from app.services.llm_service import complete, model_name

# "3 years", "3+ years", "over 5 years of experience"
_YEARS_CLAIM = re.compile(r"\b\d+\s*\+?\s*(?:year|yr)s?\b", re.IGNORECASE)

# Labels and wrappers models add despite being told not to.
_LEADING_LABEL = re.compile(r"^\s*(professional\s+)?summary\s*[:\-–]\s*", re.IGNORECASE)
_MARKDOWN = re.compile(r"[*_`#]+")


class EmptyResumeError(ValueError):
    """Raised when there are no facts to write a summary from."""


def _split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def _sanitize(text: str) -> str:
    """Strip the wrappers models add and clamp the length."""
    cleaned = (text or "").strip()

    # Some models wrap the whole answer in quotes.
    if len(cleaned) >= 2 and cleaned[0] in "\"'" and cleaned[-1] == cleaned[0]:
        cleaned = cleaned[1:-1].strip()

    cleaned = _MARKDOWN.sub("", cleaned)
    cleaned = _LEADING_LABEL.sub("", cleaned)
    cleaned = " ".join(cleaned.split())

    if len(cleaned) > SUMMARY_MAX_CHARS:
        # Cut at the last complete sentence that fits rather than mid-word.
        clipped = cleaned[:SUMMARY_MAX_CHARS]
        cut = max(clipped.rfind(". "), clipped.rfind("! "), clipped.rfind("? "))
        cleaned = clipped[: cut + 1] if cut > 0 else clipped.rstrip() + "…"

    return cleaned.strip()


def _claims_experience(text: str) -> bool:
    return bool(_YEARS_CLAIM.search(text))


def _drop_experience_claims(text: str) -> str:
    """Last resort: remove any sentence claiming a span of years."""
    kept = [s for s in _split_sentences(text) if not _YEARS_CLAIM.search(s)]
    return " ".join(kept).strip()


def generate_summary(resume: Resume, target_role: str = "") -> str:
    """Write a professional summary grounded in this resume's facts."""
    if not resume.has_content():
        raise EmptyResumeError(
            "Add some skills, education, projects or experience first — "
            "there is nothing to write a summary from yet."
        )

    user_prompt = build_summary_prompt(resume, target_role)
    summary = _sanitize(complete(SUMMARY_SYSTEM_PROMPT, user_prompt))

    # The candidate has no listed experience but the model claimed some.
    has_real_experience = any(
        item.company or item.role or item.description for item in resume.experience
    )
    if not has_real_experience and _claims_experience(summary):
        log("[resume_writer] retrying: summary claimed experience the resume does not list")
        summary = _sanitize(complete(SUMMARY_SYSTEM_PROMPT, user_prompt + NO_EXPERIENCE_CORRECTION))

        if _claims_experience(summary):
            log("[resume_writer] retry still claimed experience; dropping those sentences")
            summary = _drop_experience_claims(summary)

    if not summary:
        raise ValueError("The model returned an empty summary. Please try again.")

    return summary


def summary_model() -> str:
    return model_name()


# ── Project description improver ─────────────────────────────────────────────

# Any digit group, including percentages and decimals: "40%", "10,000", "2.5".
_NUMERIC = re.compile(r"\d+(?:[.,]\d+)*%?")

_BULLET_PREFIX = re.compile(r"^\s*(?:[•\-*•]|\d+[.)])\s*")


class EmptyProjectError(ValueError):
    """Raised when a project has no description to improve."""


def _numbers_in(text: str) -> set[str]:
    return {match.group(0) for match in _NUMERIC.finditer(text or "")}


def _invented_numbers(output: str, source: str) -> set[str]:
    """Numbers the model produced that do not appear in the author's own text.

    Digits inside technology names (HTML5, Node.js 18, ES6) are safe because
    those names come from the source, so their digits are already present.
    """
    source_digits = source or ""
    return {n for n in _numbers_in(output) if n not in source_digits}


def _clean_bullets(text: str) -> list[str]:
    """Normalise whatever the model returned into plain bullet lines."""
    lines = []
    for raw in (text or "").splitlines():
        line = _MARKDOWN.sub("", raw).strip()
        line = _BULLET_PREFIX.sub("", line).strip()
        line = " ".join(line.split())
        if line:
            lines.append(line)
    return lines


def improve_project_description(project: Project, skills: list[str] | None = None) -> str:
    """Rewrite one project's description as grounded resume bullets."""
    if not (project.description or "").strip():
        raise EmptyProjectError(
            "Describe the project in your own words first — even one rough "
            "sentence is enough for the AI to work from."
        )

    user_prompt = build_project_prompt(project, skills)
    raw = complete(PROJECT_SYSTEM_PROMPT, user_prompt)

    # Everything the author actually told us, for the invented-number check.
    source = " ".join([
        project.name or "",
        " ".join(project.technologies or []),
        project.description or "",
    ])

    invented = _invented_numbers(raw, source)
    if invented:
        log(f"[resume_writer] retrying: project bullets invented numbers {sorted(invented)}")
        raw = complete(
            PROJECT_SYSTEM_PROMPT,
            user_prompt + INVENTED_NUMBERS_CORRECTION.format(numbers=", ".join(sorted(invented))),
        )
        invented = _invented_numbers(raw, source)

    bullets = _clean_bullets(raw)

    if invented:
        # The model would not stop inventing figures; drop those bullets rather
        # than put made-up statistics on someone's resume.
        log(f"[resume_writer] dropping bullets with invented numbers {sorted(invented)}")
        bullets = [b for b in bullets if not _invented_numbers(b, source)]

    if not bullets:
        raise ValueError("The model returned no usable bullet points. Please try again.")

    return "\n".join(f"• {b}" for b in bullets[:3])
