import axios from "axios";

/*
 * Every call here goes to the Node backend at /api/v1/resume, which enforces
 * authentication and ownership. `withCredentials` sends the existing session
 * cookie, so this file adds no auth logic of its own.
 *
 * Each function returns response.data ({ message, success, ... }) and lets
 * axios throw on failure, so callers handle errors the same way the rest of
 * the app does: error.response?.data?.message
 */

const RESUME_API_END_POINT = `${import.meta.env.VITE_API_BASE_URL}/api/v1/resume`;

const config = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
};

// POST /api/v1/resume
export const createResume = async (resumeData) => {
    const res = await axios.post(RESUME_API_END_POINT, resumeData, config);
    return res.data;
};

// GET /api/v1/resume
export const getResumes = async () => {
    const res = await axios.get(RESUME_API_END_POINT, config);
    return res.data;
};

// GET /api/v1/resume/:id
export const getResumeById = async (id) => {
    const res = await axios.get(`${RESUME_API_END_POINT}/${id}`, config);
    return res.data;
};

// PUT /api/v1/resume/:id
export const updateResume = async (id, resumeData) => {
    const res = await axios.put(`${RESUME_API_END_POINT}/${id}`, resumeData, config);
    return res.data;
};

// DELETE /api/v1/resume/:id
export const deleteResume = async (id) => {
    const res = await axios.delete(`${RESUME_API_END_POINT}/${id}`, config);
    return res.data;
};

/* ── AI ──────────────────────────────────────────────────────────────────
 * These go to the Node backend too, which forwards them to the Python AI
 * service. The browser never holds an LLM key or calls the model directly.
 */

// POST /api/v1/resume/ai/summary
export const generateSummary = async (resumeData, targetRole = "") => {
    const res = await axios.post(
        `${RESUME_API_END_POINT}/ai/summary`,
        { resume: resumeData, targetRole },
        config
    );
    return res.data;
};

// POST /api/v1/resume/ai/project-description
export const improveProjectDescription = async (project, skills = []) => {
    const res = await axios.post(
        `${RESUME_API_END_POINT}/ai/project-description`,
        { project, skills },
        config
    );
    return res.data;
};

// POST /api/v1/resume/ai/review
export const reviewResume = async (resumeData) => {
    const res = await axios.post(
        `${RESUME_API_END_POINT}/ai/review`,
        { resume: resumeData },
        config
    );
    return res.data;
};

// POST /api/v1/resume/ai/ats
// Only the job id is sent — the backend loads the posting from the database.
export const matchResumeToJob = async (resumeData, jobId) => {
    const res = await axios.post(
        `${RESUME_API_END_POINT}/ai/ats`,
        { resume: resumeData, jobId },
        config
    );
    return res.data;
};

/* ── Versions ─────────────────────────────────────────────────────────── */

// POST /api/v1/resume/:id/duplicate
export const duplicateResume = async (id, { title, tailoredForJob } = {}) => {
    const res = await axios.post(
        `${RESUME_API_END_POINT}/${id}/duplicate`,
        { title, tailoredForJob },
        config
    );
    return res.data;
};

// PATCH /api/v1/resume/:id/master
export const setMasterResume = async (id) => {
    const res = await axios.patch(`${RESUME_API_END_POINT}/${id}/master`, {}, config);
    return res.data;
};
