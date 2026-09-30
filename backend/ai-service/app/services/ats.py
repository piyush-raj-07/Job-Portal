"""
ats.py — Deterministic resume/job matching.

Like the review score, the match score is computed here rather than guessed by
the LLM: the same resume against the same job must always give the same number,
and every point has to be traceable to a specific skill that did or did not
appear. The LLM's job is the advice, not the arithmetic.
"""
import re

from app.schemas.resume_schema import JobPosting, Resume

# Used only to pull keywords out of a job description when the posting has no
# structured requirements list. Not a scoring vocabulary — anything in the
# requirements field is matched whether or not it appears here.
TECH_VOCAB = {
    "react", "angular", "vue", "svelte", "next.js", "nextjs", "redux",
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang",
    "ruby", "php", "kotlin", "swift", "rust", "scala",
    "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi",
    "spring", "spring boot", "laravel", "rails", ".net",
    "mongodb", "mysql", "postgresql", "postgres", "sqlite", "redis", "oracle",
    "dynamodb", "cassandra", "elasticsearch", "firebase", "supabase",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform",
    "ci/cd", "git", "github", "gitlab", "linux", "nginx",
    "html", "css", "sass", "tailwind", "bootstrap", "material ui",
    "rest", "rest api", "graphql", "grpc", "websocket", "microservices",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "pandas", "numpy", "scikit-learn", "opencv",
    "jest", "pytest", "cypress", "selenium", "junit",
    "agile", "scrum", "jira", "figma",
}

# Words that carry no signal when comparing a job title to a resume.
_TITLE_STOPWORDS = {
    "a", "an", "and", "the", "for", "with", "of", "to", "in", "at", "on",
    "job", "role", "position", "opening", "hiring", "we", "you", "your",
    "senior", "junior", "lead", "principal", "staff", "intern", "internship",
    "i", "ii", "iii", "sr", "jr", "level", "experience", "years",
}

_WORD = re.compile(r"[a-z0-9+#./-]+")


def _normalise(text: str) -> str:
    return " ".join((text or "").lower().split())


def _resume_text(resume: Resume) -> str:
    """Everything the resume says, as one lowercase blob."""
    parts = [resume.summary, resume.title]
    parts += list(resume.skills)
    parts += resume.achievement_titles()

    for item in resume.experience:
        parts += [item.role, item.company, item.description]
    for item in resume.projects:
        parts += [item.name, item.description]
        parts += list(item.technologies)
    for item in resume.education:
        parts += [item.degree, item.field, item.college]

    return _normalise(" ".join(p for p in parts if p))


def _evidence_text(resume: Resume) -> str:
    """Only the narrative parts — where a skill is demonstrated, not just listed."""
    parts = [resume.summary]
    for item in resume.experience:
        parts += [item.role, item.description]
    for item in resume.projects:
        parts += [item.name, item.description]
    return _normalise(" ".join(p for p in parts if p))


def _mentions(haystack: str, term: str) -> bool:
    """Whole-term match, so 'go' does not match 'going' and 'r' does not match 'react'."""
    term = _normalise(term)
    if not term:
        return False
    return re.search(rf"(?<![a-z0-9+#]){re.escape(term)}(?![a-z0-9+#])", haystack) is not None


def job_terms(job: JobPosting) -> list[str]:
    """The skills a posting asks for, preserving the recruiter's own wording."""
    terms = []
    seen = set()

    for raw in job.requirements:
        for piece in re.split(r"[,;/|]| and ", raw or ""):
            term = piece.strip(" .-")
            key = term.lower()
            # Long fragments are sentences, not skills.
            if term and key not in seen and len(term) <= 40:
                seen.add(key)
                terms.append(term)

    if terms:
        return terms

    # No structured requirements — fall back to known technologies in the text.
    blob = _normalise(f"{job.title} {job.description}")
    for tech in sorted(TECH_VOCAB, key=len, reverse=True):
        if tech not in seen and _mentions(blob, tech):
            seen.add(tech)
            terms.append(tech)

    return terms


def _title_alignment(job: JobPosting, resume_blob: str) -> float:
    words = {
        w for w in _WORD.findall(_normalise(job.title))
        if w not in _TITLE_STOPWORDS and len(w) > 2
    }
    if not words:
        return 0.0
    hits = sum(1 for w in words if _mentions(resume_blob, w))
    return hits / len(words)


def match_resume_to_job(resume: Resume, job: JobPosting) -> dict:
    """Score the fit and list which required skills are present or absent.

    Weights (total 100):
      65  skill coverage  — how many required skills the resume shows at all
      20  evidence        — how many of those appear in real project/work text
                            rather than only in the skills list
      15  title alignment — does the resume read like this kind of role
    """
    resume_blob = _resume_text(resume)
    evidence_blob = _evidence_text(resume)

    required = job_terms(job)

    matched, missing, evidenced = [], [], []
    for term in required:
        if _mentions(resume_blob, term):
            matched.append(term)
            if _mentions(evidence_blob, term):
                evidenced.append(term)
        else:
            missing.append(term)

    coverage = len(matched) / len(required) if required else 0.0
    evidence = len(evidenced) / len(matched) if matched else 0.0
    alignment = _title_alignment(job, resume_blob)

    # Round each component first, then sum. Rounding the total independently
    # would let it disagree with the bars shown to the user by a point.
    coverage_points = round(65 * coverage)
    evidence_points = round(20 * evidence)
    alignment_points = round(15 * alignment)

    score = max(0, min(coverage_points + evidence_points + alignment_points, 100))

    breakdown = [
        {
            "name": "Required skills present",
            "score": coverage_points,
            "max": 65,
            "detail": (
                f"{len(matched)} of {len(required)} listed requirements appear in your resume."
                if required
                else "This posting lists no specific requirements to match against."
            ),
        },
        {
            "name": "Backed by real work",
            "score": evidence_points,
            "max": 20,
            "detail": (
                f"{len(evidenced)} of your {len(matched)} matching skills are shown in a "
                "project or job description, not just listed."
                if matched
                else "None of the required skills appear in your resume yet."
            ),
        },
        {
            "name": "Role alignment",
            "score": alignment_points,
            "max": 15,
            "detail": (
                f"Your resume reflects {round(alignment * 100)}% of the words in "
                f"“{job.title}”."
                if job.title
                else "This posting has no title to align against."
            ),
        },
    ]

    return {
        "matchScore": score,
        "matchedSkills": matched,
        "missingSkills": missing,
        # Matched but only in the skills list — the strongest rewording targets,
        # because the candidate genuinely has these and simply buried them.
        "underusedSkills": [s for s in matched if s not in evidenced],
        "breakdown": breakdown,
    }
