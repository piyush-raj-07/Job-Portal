"""
llm_service.py — The only place this service talks to an LLM.

Agents call `complete()` and never touch the provider directly, so swapping
models or providers is a change to this file alone.
"""
import threading

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.config import (
    GROQ_API_KEY,
    LLM_MAX_RETRIES,
    LLM_MODEL,
    LLM_TEMPERATURE,
    LLM_TIMEOUT_SECONDS,
)

_llm: ChatGroq | None = None
_llm_lock = threading.Lock()


class LLMUnavailable(RuntimeError):
    """Raised when the model cannot be reached or is not configured."""


def get_llm() -> ChatGroq:
    """Lazy singleton — building the client on every request is wasteful."""
    global _llm
    if _llm is None:
        with _llm_lock:
            if _llm is None:
                if not GROQ_API_KEY:
                    raise LLMUnavailable(
                        "GROQ_API_KEY is not set in backend/.env — the AI service cannot run."
                    )
                _llm = ChatGroq(
                    model=LLM_MODEL,
                    api_key=GROQ_API_KEY,
                    temperature=LLM_TEMPERATURE,
                    timeout=LLM_TIMEOUT_SECONDS,
                    max_retries=LLM_MAX_RETRIES,
                )
    return _llm


def complete(system_prompt: str, user_prompt: str) -> str:
    """Run one non-streaming completion and return its text."""
    try:
        response = get_llm().invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ])
    except LLMUnavailable:
        raise
    except Exception as exc:                                    # noqa: BLE001
        raise LLMUnavailable(f"The language model could not be reached: {exc}") from exc

    content = getattr(response, "content", "")

    # Some models return content as a list of parts rather than a plain string.
    if isinstance(content, list):
        content = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in content
        )

    return (content or "").strip()


def model_name() -> str:
    return LLM_MODEL
