import mongoose from "mongoose";
import { Resume } from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import {
    requestSummary,
    requestProjectDescription,
    requestReview,
    requestAtsMatch,
    AiServiceError,
} from "../services/aiService.js";

/*
 * Every handler here is mounted behind verifyJWT, so req.user is always set.
 * Ownership is enforced inside the database query itself: each lookup filters
 * on { _id, userId } together, so one user can never read or write another
 * user's resume even if they guess a valid resume id.
 */

// Only these keys are ever copied out of the request body. userId, _id and the
// timestamps can therefore never be set by the client.
const PERSONAL_INFO_KEYS = ["fullName", "email", "phone", "location", "linkedin", "github"];
const EDUCATION_KEYS = ["college", "degree", "field", "startYear", "endYear"];
const EXPERIENCE_KEYS = ["company", "role", "startDate", "endDate", "description"];
const PROJECT_KEYS = ["name", "technologies", "description", "github", "link"];
const ACHIEVEMENT_KEYS = ["title", "link"];

const pickFields = (source, keys) => {
    const result = {};
    for (const key of keys) {
        if (source?.[key] !== undefined) result[key] = source[key];
    }
    return result;
};

const toStringArray = (value) =>
    Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

const mapItems = (value, keys) =>
    Array.isArray(value) ? value.map((item) => pickFields(item, keys)) : [];

const mapProjects = (value) =>
    mapItems(value, PROJECT_KEYS).map((project) => ({
        ...project,
        technologies: toStringArray(project.technologies),
    }));

// Builds a whitelisted payload. Keys absent from the body are left untouched,
// so a partial body never wipes existing data.
const buildResumePayload = (body = {}) => {
    const payload = {};

    if (body.title !== undefined) payload.title = body.title;
    if (body.summary !== undefined) payload.summary = body.summary;
    if (body.template !== undefined) payload.template = body.template;
    if (body.personalInfo !== undefined) payload.personalInfo = pickFields(body.personalInfo, PERSONAL_INFO_KEYS);
    if (body.education !== undefined) payload.education = mapItems(body.education, EDUCATION_KEYS);
    if (body.experience !== undefined) payload.experience = mapItems(body.experience, EXPERIENCE_KEYS);
    if (body.projects !== undefined) payload.projects = mapProjects(body.projects);
    if (body.skills !== undefined) payload.skills = toStringArray(body.skills);
    if (body.certifications !== undefined) payload.certifications = toStringArray(body.certifications);

    if (body.achievements !== undefined) {
        payload.achievements = mapItems(body.achievements, ACHIEVEMENT_KEYS);
        // Achievements replaced the old certifications list. Clear it, otherwise
        // an old resume whose achievements were all deleted would show its old
        // certifications again (the frontend falls back to them when empty).
        payload.certifications = [];
    }

    return payload;
};

// A malformed id is a client mistake, not a server fault — answer 400 instead
// of letting mongoose throw a CastError into the 500 handler.
const invalidId = (id) => !mongoose.Types.ObjectId.isValid(id);

const handleError = (res, error, action) => {
    console.error(`Error in ${action}:`, error);

    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: error.message,
            success: false,
        });
    }

    return res.status(500).json({
        message: `Server error occurred while ${action}.`,
        success: false,
    });
};

// POST /api/v1/resume
export const createResume = async (req, res) => {
    try {
        const userId = req.user?._id;

        const resume = await Resume.create({
            ...buildResumePayload(req.body),
            userId,
        });

        return res.status(201).json({
            message: "Resume created successfully.",
            resume,
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "creating the resume");
    }
};

// GET /api/v1/resume
export const getResumes = async (req, res) => {
    try {
        const userId = req.user?._id;

        // The list page only needs headings, so the heavy fields stay behind.
        const resumes = await Resume.find({ userId })
            .select("title template isMaster parentResumeId tailoredForJob createdAt updatedAt")
            .sort({ updatedAt: -1 });

        // An empty list is a valid result, not a 404.
        return res.status(200).json({
            message: "Resumes fetched successfully.",
            resumes,
            count: resumes.length,
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "fetching resumes");
    }
};

// GET /api/v1/resume/:id
export const getResumeById = async (req, res) => {
    try {
        const userId = req.user?._id;
        const resumeId = req.params.id.trim();

        if (invalidId(resumeId)) {
            return res.status(400).json({
                message: "Invalid resume id.",
                success: false,
            });
        }

        const resume = await Resume.findOne({ _id: resumeId, userId });

        // Someone else's resume is reported as missing rather than forbidden,
        // so this endpoint cannot be used to probe which ids exist.
        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Resume fetched successfully.",
            resume,
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "fetching the resume");
    }
};

// PUT /api/v1/resume/:id
export const updateResume = async (req, res) => {
    try {
        const userId = req.user?._id;
        const resumeId = req.params.id.trim();

        if (invalidId(resumeId)) {
            return res.status(400).json({
                message: "Invalid resume id.",
                success: false,
            });
        }

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            { $set: buildResumePayload(req.body) },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Resume updated successfully.",
            resume,
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "updating the resume");
    }
};

// POST /api/v1/resume/ai/summary
// Generates a summary from the resume in the request body. Nothing is saved —
// the user reviews the text in the form and decides whether to keep it.
export const generateSummary = async (req, res) => {
    try {
        const resume = buildResumePayload(req.body?.resume);
        const targetRole = typeof req.body?.targetRole === "string" ? req.body.targetRole : "";

        const { summary, model } = await requestSummary(resume, targetRole);

        return res.status(200).json({
            message: "Summary generated successfully.",
            summary,
            model,
            success: true,
        });
    } catch (error) {
        if (error instanceof AiServiceError) {
            return res.status(error.status).json({
                message: error.message,
                success: false,
            });
        }
        return handleError(res, error, "generating the summary");
    }
};

// POST /api/v1/resume/ai/project-description
// Rewrites one project's description. Nothing is saved.
export const improveProjectDescription = async (req, res) => {
    try {
        const project = pickFields(req.body?.project, PROJECT_KEYS);
        project.technologies = toStringArray(project.technologies);
        const skills = toStringArray(req.body?.skills);

        const { description, model } = await requestProjectDescription(project, skills);

        return res.status(200).json({
            message: "Project description improved successfully.",
            description,
            model,
            success: true,
        });
    } catch (error) {
        if (error instanceof AiServiceError) {
            return res.status(error.status).json({
                message: error.message,
                success: false,
            });
        }
        return handleError(res, error, "improving the project description");
    }
};

// POST /api/v1/resume/ai/review
// Scores the resume in the request body and returns what to improve.
export const reviewResume = async (req, res) => {
    try {
        const resume = buildResumePayload(req.body?.resume);
        const review = await requestReview(resume);

        return res.status(200).json({
            message: "Resume reviewed successfully.",
            ...review,
            success: true,
        });
    } catch (error) {
        if (error instanceof AiServiceError) {
            return res.status(error.status).json({
                message: error.message,
                success: false,
            });
        }
        return handleError(res, error, "reviewing the resume");
    }
};

// POST /api/v1/resume/ai/ats
// Matches the resume against one job from the portal. The job is loaded from
// the database by id rather than trusted from the request body.
export const atsMatch = async (req, res) => {
    try {
        const jobId = (req.body?.jobId || "").trim();

        if (invalidId(jobId)) {
            return res.status(400).json({
                message: "Invalid job id.",
                success: false,
            });
        }

        const job = await Job.findById(jobId).populate("company");
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        const resume = buildResumePayload(req.body?.resume);

        const result = await requestAtsMatch(resume, {
            title: job.title || "",
            company: job.company?.name || "",
            description: job.description || "",
            requirements: Array.isArray(job.requirements) ? job.requirements : [],
            location: job.location || "",
            jobType: job.jobType || "",
            experienceLevel: job.experienceLevel || "",
        });

        return res.status(200).json({
            message: "Resume matched to the job successfully.",
            ...result,
            job: {
                _id: job._id,
                title: job.title,
                company: job.company?.name || "",
            },
            success: true,
        });
    } catch (error) {
        if (error instanceof AiServiceError) {
            return res.status(error.status).json({
                message: error.message,
                success: false,
            });
        }
        return handleError(res, error, "matching the resume to the job");
    }
};

// POST /api/v1/resume/:id/duplicate
// Clones a resume. The original is never modified — this is how tailoring for
// a job produces a new version instead of overwriting the master.
export const duplicateResume = async (req, res) => {
    try {
        const userId = req.user?._id;
        const resumeId = req.params.id.trim();

        if (invalidId(resumeId)) {
            return res.status(400).json({
                message: "Invalid resume id.",
                success: false,
            });
        }

        const source = await Resume.findOne({ _id: resumeId, userId });
        if (!source) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false,
            });
        }

        const { title, tailoredForJob } = req.body || {};

        const copy = await Resume.create({
            userId,
            title: (title || `${source.title} (copy)`).trim(),
            personalInfo: source.personalInfo,
            summary: source.summary,
            education: source.education,
            experience: source.experience,
            projects: source.projects,
            skills: source.skills,
            achievements: source.achievements,
            certifications: source.certifications,
            template: source.template,
            // A copy is never the master, and always remembers its origin.
            isMaster: false,
            parentResumeId: source._id,
            tailoredForJob: {
                jobId: tailoredForJob?.jobId || null,
                jobTitle: tailoredForJob?.jobTitle || "",
                companyName: tailoredForJob?.companyName || "",
            },
        });

        return res.status(201).json({
            message: "Resume duplicated successfully.",
            resume: copy,
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "duplicating the resume");
    }
};

// PATCH /api/v1/resume/:id/master
// Marks one resume as the user's master. Only one can hold the flag.
export const setMasterResume = async (req, res) => {
    try {
        const userId = req.user?._id;
        const resumeId = req.params.id.trim();

        if (invalidId(resumeId)) {
            return res.status(400).json({
                message: "Invalid resume id.",
                success: false,
            });
        }

        const target = await Resume.findOne({ _id: resumeId, userId });
        if (!target) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false,
            });
        }

        // Clear the flag everywhere else first so it can never be held twice.
        await Resume.updateMany({ userId, _id: { $ne: target._id } }, { $set: { isMaster: false } });
        target.isMaster = true;
        await target.save();

        return res.status(200).json({
            message: "Master resume updated successfully.",
            resume: target,
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "setting the master resume");
    }
};

// DELETE /api/v1/resume/:id
export const deleteResume = async (req, res) => {
    try {
        const userId = req.user?._id;
        const resumeId = req.params.id.trim();

        if (invalidId(resumeId)) {
            return res.status(400).json({
                message: "Invalid resume id.",
                success: false,
            });
        }

        const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Resume deleted successfully.",
            success: true,
        });
    } catch (error) {
        return handleError(res, error, "deleting the resume");
    }
};
