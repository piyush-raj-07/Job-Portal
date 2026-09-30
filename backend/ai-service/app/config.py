"""
config.py — Central configuration for the resume AI service.

Reads `backend/.env`, the same file the Node backend and the chatbot use, so
GROQ_API_KEY is defined once for the whole project.
"""
import os

from dotenv import load_dotenv

# app/config.py -> app -> ai-service -> backend
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")
load_dotenv(dotenv_path=ENV_PATH)


def _int(key: str, default: int) -> int:
    try:
        return int(os.getenv(key, default))
    except (TypeError, ValueError):
        return default


def _float(key: str, default: float) -> float:
    try:
        return float(os.getenv(key, default))
    except (TypeError, ValueError):
        return default


# ── Credentials ───────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Optional shared secret. When set, the Node backend must send it as
# X-AI-Service-Token and every other caller is rejected. Leave it unset in
# local development and the check is skipped.
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "")

# ── Model ─────────────────────────────────────────────────────────────────────
# Same Groq model the chatbot settled on. Override per-service if needed.
LLM_MODEL = os.getenv("AI_SERVICE_LLM_MODEL", "openai/gpt-oss-120b")

# Low temperature: a resume summary should restate facts, not improvise.
LLM_TEMPERATURE = _float("AI_SERVICE_LLM_TEMPERATURE", 0.2)

# Groq can hang; without a ceiling a stalled call would hold a worker thread.
LLM_TIMEOUT_SECONDS = _int("AI_SERVICE_LLM_TIMEOUT", 45)
LLM_MAX_RETRIES = _int("AI_SERVICE_LLM_MAX_RETRIES", 1)

# ── Summary generation ────────────────────────────────────────────────────────
SUMMARY_MAX_CHARS = _int("AI_SERVICE_SUMMARY_MAX_CHARS", 700)
