"""
ats.py — Prompts for tailoring a resume to a specific job.

The match score and the matched/missing skill lists come from
app/services/ats.py. The model only writes the recommendations, and the single
rule that matters most is that it must never tell the candidate to claim a
skill they do not have.
"""
from app.schemas.resume_schema import JobPosting, Resume

ATS_SYSTEM_PROMPT = """You advise a candidate on tailoring their existing resume to one job.

You will be given the candidate's resume, the job posting, and a computed
analysis listing which required skills their resume already shows and which it
does not.

THE RULE THAT OVERRIDES EVERYTHING ELSE
Never tell the candidate to add a skill, technology, tool, job, certification
or achievement they do not already have. Not "add Docker to your skills", not
"mention Kubernetes experience", not "include AWS". If a required skill is in
the MISSING list, the candidate does not have it, and no recommendation may
suggest putting it on the resume.

You MAY tell them to:
- Move a skill they already have somewhere more visible.
- Reword an existing project or job description to use the posting's own
  vocabulary for something they genuinely did.
- Expand on work they already did that is relevant to this role.
- Reorder sections so the most relevant material comes first.
- Name a technology in a project description when it is already listed under
  their skills or that project's technologies.

The UNDERUSED list is your best material: those are skills the candidate has
listed but has not demonstrated anywhere. Recommending they show one of those
in a real project description is always fair game.

For a genuinely missing skill, the only acceptable mention is honest framing of
a gap, phrased as learning rather than claiming — and at most one such point.

STYLE
Each recommendation is one specific, actionable sentence under 25 words. Name
the section, project or job you are talking about. No bullet characters, no
markdown, no preamble.

OUTPUT
Return ONLY a JSON object in exactly this shape:

{"recommendations": ["...", "..."]}

Give 3 to 5 recommendations, most valuable first."""


def _listing(items: list[str]) -> str:
    return ", ".join(items) if items else "NONE"


def build_ats_prompt(resume: Resume, job: JobPosting, analysis: dict) -> str:
    """Render the job, the resume and the computed match for the model."""
    lines = [
        "JOB POSTING:",
        f"  TITLE: {job.title or 'Not given'}",
        f"  COMPANY: {job.company or 'Not given'}",
        f"  LOCATION: {job.location or 'Not given'}",
        f"  EXPERIENCE LEVEL: {job.experienceLevel or 'Not given'}",
        f"  REQUIREMENTS: {_listing(list(job.requirements))}",
        f"  DESCRIPTION: {' '.join((job.description or 'Not given').split())}",
        "",
        "COMPUTED MATCH ANALYSIS:",
        f"  MATCH SCORE: {analysis['matchScore']}/100",
        f"  MATCHED (candidate has these): {_listing(analysis['matchedSkills'])}",
        f"  UNDERUSED (listed but never demonstrated — best rewording targets): "
        f"{_listing(analysis['underusedSkills'])}",
        f"  MISSING (candidate does NOT have these — never tell them to claim any): "
        f"{_listing(analysis['missingSkills'])}",
        "",
        "CANDIDATE'S RESUME:",
        f"  SUMMARY: {resume.summary.strip() or 'NONE'}",
        f"  SKILLS: {_listing(list(resume.skills))}",
    ]

    lines.append("  EXPERIENCE:")
    if resume.experience:
        for x in resume.experience:
            header = " at ".join(p for p in (x.role, x.company) if p) or "blank entry"
            lines.append(f"    - {header}: {' '.join((x.description or 'no description').split())}")
    else:
        lines.append("    NONE — this candidate has no work experience.")

    lines.append("  PROJECTS:")
    if resume.projects:
        for p in resume.projects:
            lines.append(
                f"    - {p.name or 'Untitled'} [{_listing(list(p.technologies))}]: "
                f"{' '.join((p.description or 'no description').split())}"
            )
    else:
        lines.append("    NONE")

    lines += [
        f"  ACHIEVEMENTS / CERTIFICATIONS: {_listing(resume.achievement_titles())}",
        "",
        "Return the JSON object of recommendations now.",
    ]

    return "\n".join(lines)


JSON_RETRY_CORRECTION = """

Your previous reply was not valid JSON. Return ONLY a JSON object of the form
{"recommendations": []} with no other text."""
