/*
 * Pure helpers shared by every resume template.
 *
 * Kept out of the .jsx component files so those export components only, which
 * is what fast refresh needs to hot-reload a template without losing state.
 */

/* A description textarea can hold several lines. Render them as bullets and
   strip any bullet character the user typed themselves. */
export const toBullets = (text) =>
    (text || "")
        .split("\n")
        .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
        .filter(Boolean);

/* A section only renders once it holds real content, so every template reads
   like a finished resume rather than an empty skeleton. */
export const filledEducation = (education) =>
    (education || []).filter((e) => e.college || e.degree || e.field);

export const filledExperience = (experience) =>
    (experience || []).filter((e) => e.company || e.role || e.description);

export const filledProjects = (projects) =>
    (projects || []).filter(
        (p) => p.name || p.description || p.technologies?.length || p.github || p.link
    );

export const filledAchievements = (achievements) =>
    (achievements || []).filter((a) => a.title);

export const isResumeEmpty = (data) =>
    !data.personalInfo.fullName &&
    !data.summary &&
    !filledEducation(data.education).length &&
    !filledExperience(data.experience).length &&
    !filledProjects(data.projects).length &&
    !data.skills.length &&
    !filledAchievements(data.achievements).length;

export const contactValues = (personalInfo) =>
    [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);

export const linkValues = (personalInfo) =>
    [personalInfo.linkedin, personalInfo.github].filter(Boolean);

/* The list of templates offered in the picker. Must stay in step with the
   `template` enum in backend/models/resume.model.js. */
export const TEMPLATES = [
    { value: "modern", label: "Modern", hint: "Centred header, colour accents" },
    { value: "classic", label: "Classic", hint: "Serif, traditional, ATS-safe" },
    { value: "minimal", label: "Minimal", hint: "Quiet, lots of whitespace" },
    { value: "developer", label: "Developer", hint: "Monospace, projects first" },
];
