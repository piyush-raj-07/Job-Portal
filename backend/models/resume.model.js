import mongoose from "mongoose";

/*
 * Structured resume storage — the resume is kept as data, not as a PDF blob,
 * so it can be edited, previewed, re-templated and analysed by the AI service.
 *
 * These keys mirror client/src/components/resume/resumeSchema.js exactly.
 * Keep the two in sync when either side changes.
 */

// `_id: false` on the sub-schemas keeps the stored documents shaped exactly
// like the objects the React form sends, with no extra generated fields.
const educationSchema = new mongoose.Schema({
    college: { type: String, default: "", trim: true },
    degree: { type: String, default: "", trim: true },
    field: { type: String, default: "", trim: true },
    startYear: { type: String, default: "", trim: true },
    endYear: { type: String, default: "", trim: true },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    company: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true },
    startDate: { type: String, default: "", trim: true },
    endDate: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
}, { _id: false });

const projectSchema = new mongoose.Schema({
    name: { type: String, default: "", trim: true },
    technologies: [{ type: String, trim: true }],
    description: { type: String, default: "", trim: true },
    github: { type: String, default: "", trim: true }, // repository link
    link: { type: String, default: "", trim: true },   // live demo / other link
}, { _id: false });

const achievementSchema = new mongoose.Schema({
    title: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true }, // optional proof (certificate, article)
}, { _id: false });

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: "Untitled Resume",
        trim: true
    },
    personalInfo: {
        fullName: { type: String, default: "", trim: true },
        email: { type: String, default: "", trim: true },
        phone: { type: String, default: "", trim: true },
        location: { type: String, default: "", trim: true },
        linkedin: { type: String, default: "", trim: true },
        github: { type: String, default: "", trim: true },
    },
    summary: {
        type: String,
        default: "",
        trim: true
    },
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    skills: [{ type: String, trim: true }],
    achievements: [achievementSchema],
    // Old field, replaced by achievements. Kept so old resumes still load —
    // the frontend converts it into achievements when opening them.
    certifications: [{ type: String, trim: true }],
    template: {
        type: String,
        enum: ["modern", "classic", "minimal", "developer"],
        default: "modern"
    },

    // ── Versioning ───────────────────────────────────────────────────────
    // One resume per user can be the master. Tailored copies point back to
    // the resume they were cloned from, and the original is never overwritten.
    isMaster: {
        type: Boolean,
        default: false
    },
    parentResumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        default: null
    },
    tailoredForJob: {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
        jobTitle: { type: String, default: "", trim: true },
        companyName: { type: String, default: "", trim: true },
    }
}, { timestamps: true });

// The "My Resumes" list is always "this user's resumes, newest edit first".
resumeSchema.index({ userId: 1, updatedAt: -1 });

export const Resume = mongoose.model("Resume", resumeSchema);
