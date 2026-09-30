"""
reviewer.py — Prompts for the resume reviewer.

The numeric score is computed by app/services/rubric.py, not here. The model's
job is the qualitative half: naming what is genuinely good, what is weak, and
what to do about it — all grounded in the resume it is shown.
"""
from app.schemas.resume_schema import Resume

REVIEWER_SYSTEM_PROMPT = """You review resumes for software engineering candidates.

You will be given one candidate's resume and a scored breakdown produced by a
fixed rubric. Write the qualitative half of the review.

ABSOLUTE RULES
1. Judge only what is in the resume. Never assume experience, seniority or
   skills that are not written there.
2. Never tell the candidate to add a skill, technology, job or achievement they
   do not have. Advice must be about presenting what is already there better:
   rewording, quantifying, reordering, expanding a description they wrote.
   Telling them to "learn Docker" is out of scope; telling them to "name the
   database you used in the Job Portal project" is exactly right.
3. Ground every point in something concrete. Quote or name the section,
   project or wording you are talking about. "Summary is generic" is weak;
   "The summary says 'passionate developer' without naming any technology" is
   what to write.
4. Do not contradict the rubric breakdown you are given. If it says the summary
   scored full marks, do not call the summary a problem.

WHAT TO WRITE
- strengths: 2 to 4 things this resume genuinely does well.
- issues: 2 to 5 concrete weaknesses, most damaging first.
- suggestions: 3 to 5 specific actions, each one the candidate could do in a
  few minutes with information they already have.

STYLE
Each item is one sentence, under 20 words, no bullet characters, no markdown.

OUTPUT
Return ONLY a JSON object, no prose before or after, in exactly this shape:

{"strengths": ["..."], "issues": ["..."], "suggestions": ["..."]}"""


def _describe_list(items: list[str]) -> str:
    return ", ".join(items) if items else "NONE"


def build_review_prompt(resume: Resume, total: int, breakdown: list[dict]) -> str:
    """Render the resume plus the rubric result the model must stay consistent with."""
    lines = [f"OVERALL RUBRIC SCORE: {total}/100", "", "RUBRIC BREAKDOWN:"]
    for row in breakdown:
        lines.append(f"  - {row['name']}: {row['score']}/{row['max']} — {row['detail']}")

    lines += ["", "RESUME:", "", f"TITLE: {resume.title or 'Untitled'}"]

    info = resume.personalInfo
    contact = [x for x in (info.email, info.phone, info.location, info.linkedin, info.github) if x]
    lines.append(f"CONTACT: {_describe_list(contact)}")

    lines.append(f"SUMMARY: {resume.summary.strip() or 'NONE'}")
    lines.append(f"SKILLS: {_describe_list(list(resume.skills))}")

    lines.append("")
    lines.append("EDUCATION:")
    if resume.education:
        for e in resume.education:
            parts = [p for p in (e.degree, e.field, e.college, f"{e.startYear}-{e.endYear}".strip("-")) if p]
            lines.append(f"  - {' | '.join(parts) if parts else 'blank entry'}")
    else:
        lines.append("  NONE")

    lines.append("")
    lines.append("EXPERIENCE:")
    if resume.experience:
        for x in resume.experience:
            header = " at ".join(p for p in (x.role, x.company) if p) or "blank entry"
            span = " to ".join(p for p in (x.startDate, x.endDate) if p)
            lines.append(f"  - {header}{f' ({span})' if span else ''}")
            lines.append(f"    description: {' '.join((x.description or 'NONE').split())}")
    else:
        lines.append("  NONE — this candidate has no work experience.")

    lines.append("")
    lines.append("PROJECTS:")
    if resume.projects:
        for p in resume.projects:
            lines.append(f"  - {p.name or 'Untitled'} [{_describe_list(list(p.technologies))}]")
            lines.append(f"    description: {' '.join((p.description or 'NONE').split())}")
    else:
        lines.append("  NONE")

    lines.append("")
    lines.append(f"ACHIEVEMENTS / CERTIFICATIONS: {_describe_list(resume.achievement_titles())}")
    lines.append("")
    lines.append("Return the JSON object now.")

    return "\n".join(lines)


JSON_RETRY_CORRECTION = """

Your previous reply was not valid JSON. Return ONLY a JSON object of the form
{"strengths": [], "issues": [], "suggestions": []} with no other text."""
