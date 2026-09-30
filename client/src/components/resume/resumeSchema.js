/*
 * Canonical resume shape for the whole feature.
 * These exact keys travel React → Node/Express → MongoDB → Python AI service,
 * so keep this file and the backend Resume model in sync.
 */

export const EMPTY_EDUCATION = { college: "", degree: "", field: "", startYear: "", endYear: "" };
export const EMPTY_EXPERIENCE = { company: "", role: "", startDate: "", endDate: "", description: "" };

// `github` is the repository, `link` is anything else worth linking to —
// a live demo, a case study, a published package.
export const EMPTY_PROJECT = { name: "", technologies: [], description: "", github: "", link: "" };

// An achievement is a line of text with an optional supporting link
// (a certificate, a leaderboard, an article).
export const EMPTY_ACHIEVEMENT = { title: "", link: "" };

export const INITIAL_RESUME = {
    title: "Untitled Resume",
    personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "" },
    summary: "",
    education: [{ ...EMPTY_EDUCATION }],
    experience: [],
    projects: [],
    skills: [],
    achievements: [],
    template: "modern",
};

const toArray = (value) => (Array.isArray(value) ? value : []);

/*
 * Converts a resume document from the API into form state.
 *
 * Server documents carry _id, userId and timestamps that the form must not
 * hold, and a resume saved before a field existed may be missing it entirely.
 * Merging onto the empty templates guarantees every input stays controlled —
 * an undefined value would flip an input to uncontrolled and warn.
 */
export const toFormState = (resume = {}) => ({
    title: resume.title ?? INITIAL_RESUME.title,
    personalInfo: { ...INITIAL_RESUME.personalInfo, ...(resume.personalInfo || {}) },
    summary: resume.summary ?? "",
    education: toArray(resume.education).map((item) => ({ ...EMPTY_EDUCATION, ...item })),
    experience: toArray(resume.experience).map((item) => ({ ...EMPTY_EXPERIENCE, ...item })),
    projects: toArray(resume.projects).map((item) => ({
        ...EMPTY_PROJECT,
        ...item,
        technologies: toArray(item.technologies),
    })),
    skills: toArray(resume.skills),
    achievements: toAchievements(resume),
    template: resume.template || INITIAL_RESUME.template,
});

/*
 * Achievements replaced the old certifications list, which held plain strings.
 * Any resume saved before that change is carried over rather than silently
 * losing its content.
 */
function toAchievements(resume) {
    const source = toArray(resume.achievements).length
        ? toArray(resume.achievements)
        : toArray(resume.certifications);

    return source.map((item) =>
        typeof item === "string"
            ? { ...EMPTY_ACHIEVEMENT, title: item }
            : { ...EMPTY_ACHIEVEMENT, ...item }
    );
}

/*
 * Makes a user-typed address safe to use as an href. People type
 * "github.com/me" far more often than "https://github.com/me", and a bare
 * value would otherwise resolve against our own origin.
 * Returns "" for anything that is not a plain web address, so a hostile value
 * such as "javascript:..." never reaches an anchor.
 */
export const toHref = (value) => {
    const raw = (value || "").trim();
    if (!raw) return "";

    if (/^https?:\/\//i.test(raw)) return raw;

    // Reject any other scheme (javascript:, data:, mailto:, ...).
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return "";

    // Looks like a bare domain or path — assume https.
    return `https://${raw.replace(/^\/+/, "")}`;
};

/* A shorter label for a long URL, so the resume shows "github.com/me/repo"
   rather than the full address with protocol and query string. */
export const toLinkLabel = (value) => {
    const raw = (value || "").trim();
    if (!raw) return "";
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
};
