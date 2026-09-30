"""
resume_routes.py — HTTP surface for the resume AI features.

Routes stay thin: authorise, delegate to an agent, shape the response.

Endpoints are declared with `def` rather than `async def` on purpose. LLM calls
block; inside an `async` route they would stall the event loop and freeze every
other request. FastAPI runs sync endpoints on a worker thread pool instead.
"""
from fastapi import APIRouter, Header, HTTPException

from app.agents.resume_writer import (
    EmptyProjectError,
    EmptyResumeError,
    generate_summary,
    improve_project_description,
    summary_model,
)
from app.agents.ats_optimizer import EmptyResumeError as EmptyAtsResumeError
from app.agents.ats_optimizer import tailor_resume_for_job
from app.agents.reviewer import EmptyResumeError as EmptyReviewResumeError
from app.agents.reviewer import review_resume
from app.config import AI_SERVICE_TOKEN
from app.log import log
from app.schemas.resume_schema import (
    AtsRequest,
    AtsResponse,
    ProjectDescriptionRequest,
    ProjectDescriptionResponse,
    ReviewRequest,
    ReviewResponse,
    SummaryRequest,
    SummaryResponse,
)
from app.services.llm_service import LLMUnavailable

router = APIRouter()


def _authorise(token: str | None) -> None:
    """Only the Node backend may call this service, when a token is configured."""
    if AI_SERVICE_TOKEN and token != AI_SERVICE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid AI service token.")


def _run(action: str, work):
    """Shared error translation for every agent call.

    422 means the user's input is too thin — their problem to fix, not a fault.
    503 means the model is unreachable. 502 means it answered unusably.
    """
    try:
        return work()
    except (EmptyResumeError, EmptyProjectError, EmptyReviewResumeError,
            EmptyAtsResumeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except LLMUnavailable as exc:
        log(f"[routes] LLM unavailable during {action}: {exc}")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:                                    # noqa: BLE001
        log(f"[routes] {action} failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Could not complete {action}.") from exc


@router.post("/summary", response_model=SummaryResponse)
def summary(payload: SummaryRequest, x_ai_service_token: str | None = Header(default=None)):
    """Generate a professional summary from the resume's own facts."""
    _authorise(x_ai_service_token)
    text = _run("the summary", lambda: generate_summary(payload.resume, payload.targetRole))
    return SummaryResponse(summary=text, model=summary_model())


@router.post("/project-description", response_model=ProjectDescriptionResponse)
def project_description(
    payload: ProjectDescriptionRequest,
    x_ai_service_token: str | None = Header(default=None),
):
    """Rewrite one project's description as grounded resume bullet points."""
    _authorise(x_ai_service_token)
    text = _run(
        "the project description",
        lambda: improve_project_description(payload.project, payload.skills),
    )
    return ProjectDescriptionResponse(description=text, model=summary_model())


@router.post("/review", response_model=ReviewResponse)
def review(payload: ReviewRequest, x_ai_service_token: str | None = Header(default=None)):
    """Score the resume against a fixed rubric and describe what to improve."""
    _authorise(x_ai_service_token)
    result = _run("the review", lambda: review_resume(payload.resume))
    return ReviewResponse(**result)


@router.post("/ats-match", response_model=AtsResponse)
def ats_match(payload: AtsRequest, x_ai_service_token: str | None = Header(default=None)):
    """Match the resume against one job posting and say how to tailor it."""
    _authorise(x_ai_service_token)
    result = _run("the job match", lambda: tailor_resume_for_job(payload.resume, payload.job))
    return AtsResponse(**result)
