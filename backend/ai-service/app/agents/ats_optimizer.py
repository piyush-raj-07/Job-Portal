"""
ats_optimizer.py — The job-tailoring agent.

Same split as the reviewer: the score and the skill lists are computed, the
advice is written. On top of that there is a hard filter — any recommendation
that tells the candidate to claim a skill from the MISSING list is dropped
before it ever reaches them, no matter how the model phrased it.
"""
import re

from app.log import log
from app.prompts.ats import ATS_SYSTEM_PROMPT, JSON_RETRY_CORRECTION, build_ats_prompt
from app.schemas.resume_schema import JobPosting, Resume
from app.services.ats import match_resume_to_job
from app.services.llm_service import complete, model_name
from app.agents.reviewer import _clean_items, _extract_json

# Verbs that mean "put this on your resume".
_CLAIM_VERB = re.compile(
    r"\b(add|include|list|mention|showcase|highlight|feature|incorporate|insert|put)\b",
    re.IGNORECASE,
)

# Phrasings that honestly frame a gap rather than claiming the skill.
_HONEST_GAP = re.compile(
    r"\b(learn|learning|studying|currently|familiaris|familiariz|if you have|"
    r"once you|consider learning|do not have|don't have|lack)\b",
    re.IGNORECASE,
)


class EmptyResumeError(ValueError):
    """Raised when there is not enough resume to match against a job."""


def _mentions_term(text: str, term: str) -> bool:
    term = (term or "").strip().lower()
    if not term:
        return False
    return re.search(rf"(?<![a-z0-9+#]){re.escape(term)}(?![a-z0-9+#])", text.lower()) is not None


def _suggests_claiming_missing(recommendation: str, missing: list[str]) -> str | None:
    """Return the missing skill this recommendation tells the user to claim, if any.

    A recommendation that names a missing skill is only allowed through when it
    frames it honestly as a gap ("consider learning Docker") rather than as
    something to put on the resume ("add Docker to your skills").
    """
    for term in missing:
        if _mentions_term(recommendation, term):
            if _CLAIM_VERB.search(recommendation) and not _HONEST_GAP.search(recommendation):
                return term
    return None


def tailor_resume_for_job(resume: Resume, job: JobPosting) -> dict:
    """Score the resume against one job and say how to present it better."""
    if not resume.has_content():
        raise EmptyResumeError(
            "Fill in your skills, projects or experience first — there is "
            "nothing to match against this job yet."
        )

    analysis = match_resume_to_job(resume, job)

    user_prompt = build_ats_prompt(resume, job, analysis)
    parsed = _extract_json(complete(ATS_SYSTEM_PROMPT, user_prompt))

    if parsed is None:
        log("[ats] first reply was not valid JSON; retrying")
        parsed = _extract_json(complete(ATS_SYSTEM_PROMPT, user_prompt + JSON_RETRY_CORRECTION))

    recommendations = _clean_items((parsed or {}).get("recommendations"), 6)

    # Hard filter: never ship advice to claim a skill the candidate lacks.
    kept = []
    for recommendation in recommendations:
        offending = _suggests_claiming_missing(recommendation, analysis["missingSkills"])
        if offending:
            log(f"[ats] dropped a recommendation telling the user to claim '{offending}'")
            continue
        kept.append(recommendation)

    if not kept:
        # Fall back to advice derived from what the candidate genuinely has.
        kept = _fallback_recommendations(analysis)

    return {
        **analysis,
        "recommendations": kept[:5],
        "model": model_name(),
    }


def _fallback_recommendations(analysis: dict) -> list[str]:
    """Safe, grounded advice when the model gives nothing usable."""
    out = []

    for skill in analysis["underusedSkills"][:3]:
        out.append(
            f"You list {skill} but never show it — name it in a project or job "
            f"description where you actually used it."
        )

    if analysis["matchedSkills"] and not out:
        out.append(
            f"Lead your summary with {analysis['matchedSkills'][0]}, which this "
            f"posting asks for and you already have."
        )

    if analysis["missingSkills"]:
        out.append(
            "This posting asks for skills your resume does not show. Apply anyway, "
            "but lead with the requirements you do meet."
        )

    return out or ["Your resume already covers this posting's stated requirements."]
