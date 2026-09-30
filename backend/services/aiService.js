/*
 * aiService.js — The Node backend's client for the Python resume AI service.
 *
 * The browser never calls the AI service or the LLM directly: the API key
 * lives in backend/.env and only this process reads it. Every AI request is
 * authenticated by the Node layer first and forwarded from here.
 *
 * Uses the global fetch built into Node 18+, so no new dependency.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";
const AI_SERVICE_TOKEN = process.env.AI_SERVICE_TOKEN || "";

// An LLM call takes a few seconds; a hung one must not hold the request open.
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 60000;

// Errors carrying a status are safe to surface to the user with that status.
class AiServiceError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "AiServiceError";
        this.status = status;
    }
}

const postToAiService = async (path, body) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(`${AI_SERVICE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(AI_SERVICE_TOKEN ? { "X-AI-Service-Token": AI_SERVICE_TOKEN } : {}),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw new AiServiceError("The AI service took too long to respond. Please try again.", 504);
        }
        // ECONNREFUSED etc — the python service is not running.
        throw new AiServiceError("The AI service is unavailable. Please try again later.", 503);
    } finally {
        clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // FastAPI puts the human-readable reason in `detail`.
        const message = typeof data.detail === "string"
            ? data.detail
            : "The AI service could not handle that request.";

        // 4xx from the AI service is about the user's input, so pass it through.
        // Anything else is our problem and is reported as a bad gateway.
        throw new AiServiceError(message, response.status >= 400 && response.status < 500
            ? response.status
            : 502);
    }

    return data;
};

/**
 * Ask the AI service for a professional summary built from this resume.
 * @param {object} resume     the structured resume
 * @param {string} targetRole optional role to orient the wording toward
 */
export const requestSummary = async (resume, targetRole = "") => {
    const data = await postToAiService("/resume/summary", { resume, targetRole });
    return { summary: data.summary, model: data.model };
};

/**
 * Rewrite one project's description into resume bullet points.
 * @param {object} project the single project being improved
 * @param {string[]} skills the candidate's wider skill list, for wording only
 */
export const requestProjectDescription = async (project, skills = []) => {
    const data = await postToAiService("/resume/project-description", { project, skills });
    return { description: data.description, model: data.model };
};

/**
 * Score a resume against the fixed rubric and describe what to improve.
 * @param {object} resume the structured resume
 */
export const requestReview = async (resume) => {
    const data = await postToAiService("/resume/review", { resume });
    return {
        score: data.score,
        breakdown: data.breakdown,
        strengths: data.strengths,
        issues: data.issues,
        suggestions: data.suggestions,
        model: data.model,
    };
};

/**
 * Match a resume against one job posting and get tailoring advice.
 * @param {object} resume the structured resume
 * @param {object} job    the flattened job posting
 */
export const requestAtsMatch = async (resume, job) => {
    const data = await postToAiService("/resume/ats-match", { resume, job });
    return {
        matchScore: data.matchScore,
        matchedSkills: data.matchedSkills,
        missingSkills: data.missingSkills,
        underusedSkills: data.underusedSkills,
        breakdown: data.breakdown,
        recommendations: data.recommendations,
        model: data.model,
    };
};

export { AiServiceError };
