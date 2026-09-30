"""
main.py — Entry point for the resume AI service.

    cd backend/ai-service
    uvicorn app.main:app --reload --port 8001 --host 127.0.0.1

Only the Node backend is meant to call this service. Bind it to 127.0.0.1 so
it is not reachable from outside the machine, and set AI_SERVICE_TOKEN in
backend/.env once it is deployed anywhere shared.
"""
from fastapi import FastAPI

from app.config import LLM_MODEL
from app.log import use_utf8_console
from app.routes.resume_routes import router as resume_router

# Resume text and LLM replies contain characters the Windows console codepage
# cannot encode; without this, printing a traceback can itself raise.
use_utf8_console()

app = FastAPI(title="Resume AI Service")

app.include_router(resume_router, prefix="/resume", tags=["resume"])


@app.get("/")
def health():
    """Liveness probe — also confirms which model is configured."""
    return {"status": "ok", "service": "resume-ai", "model": LLM_MODEL}
