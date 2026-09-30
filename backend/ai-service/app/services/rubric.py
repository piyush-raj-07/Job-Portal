"""
rubric.py — The resume score.

The score is computed here in plain Python, not asked of the LLM. A language
model asked to "rate this resume out of 100" returns a different number each
run and cannot say why. This rubric is reproducible — the same resume always
scores the same — and every point is attributable to a named criterion the
user can act on.

The LLM still writes the qualitative strengths, issues and suggestions; it is
simply not trusted with arithmetic.

Weights total 100.
"""
import re

from app.schemas.resume_schema import Resume

_DIGIT = re.compile(r"\d")

# Verbs that open a strong resume bullet. Deliberately a plain list: a bullet
# starting "Responsible for" or "Worked on" is the weak form we want to catch.
ACTION_VERBS = {
    "architected", "automated", "built", "collaborated", "configured", "created",
    "delivered", "deployed", "designed", "developed", "engineered", "enhanced",
    "expanded", "implemented", "improved", "increased", "integrated", "launched",
    "led", "maintained", "managed", "migrated", "optimised", "optimized",
    "programmed", "reduced", "refactored", "resolved", "scaled", "shipped",
    "streamlined", "tested", "wrote",
}


def _lines(text: str) -> list[str]:
    """Split a description into its bullet lines."""
    return [
        re.sub(r"^\s*[•\-*]\s*", "", line).strip()
        for line in (text or "").splitlines()
        if line.strip()
    ]


def _describables(resume: Resume) -> list[str]:
    """Every free-text description on the resume, experience and projects alike."""
    out = [x.description for x in resume.experience if (x.description or "").strip()]
    out += [p.description for p in resume.projects if (p.description or "").strip()]
    return out


def _score_contact(resume: Resume) -> tuple[int, str]:
    info = resume.personalInfo
    points = 0
    missing = []

    if info.email.strip():
        points += 3
    else:
        missing.append("email")

    if info.phone.strip():
        points += 2
    else:
        missing.append("phone")

    if info.location.strip():
        points += 2
    else:
        missing.append("location")

    if info.linkedin.strip() or info.github.strip():
        points += 3
    else:
        missing.append("a LinkedIn or GitHub link")

    detail = "All contact details present." if not missing else f"Missing {', '.join(missing)}."
    return points, detail


def _score_summary(resume: Resume) -> tuple[int, str]:
    words = len(resume.summary.split())

    if words == 0:
        return 0, "No professional summary. Recruiters read this first."
    if words < 25:
        return 6, f"Summary is only {words} words — too thin to say much."
    if words <= 90:
        return 15, f"Summary is a well-judged {words} words."
    return 10, f"Summary is {words} words — trim it to under 90."


def _score_skills(resume: Resume) -> tuple[int, str]:
    count = len([s for s in resume.skills if s.strip()])

    if count == 0:
        return 0, "No skills listed."
    if count <= 3:
        return 5, f"Only {count} skills listed — add the rest of your stack."
    if count <= 7:
        return 10, f"{count} skills listed. A few more would broaden your keyword match."
    return 15, f"{count} skills listed."


def _score_depth(resume: Resume) -> tuple[int, str]:
    """Substantial experience or project entries. Either counts."""
    substantial = 0
    for item in resume.experience:
        if (item.role or item.company) and len(item.description or "") >= 40:
            substantial += 1
    for item in resume.projects:
        if item.name and len(item.description or "") >= 40:
            substantial += 1

    if substantial == 0:
        return 0, "No experience or project entries with a real description."
    if substantial == 1:
        return 8, "Only one substantial entry. Two or three read far stronger."
    if substantial == 2:
        return 14, "Two substantial entries."
    return 20, f"{substantial} substantial entries."


def _score_impact(resume: Resume) -> tuple[int, str]:
    descriptions = _describables(resume)

    if not descriptions:
        return 0, "Nothing described, so no measurable impact to show."

    with_numbers = sum(1 for d in descriptions if _DIGIT.search(d))
    ratio = with_numbers / len(descriptions)

    if with_numbers == 0:
        return 0, "No entry quantifies its impact. Numbers make claims credible."
    if ratio < 0.5:
        return 8, f"{with_numbers} of {len(descriptions)} entries include a number."
    return 15, f"{with_numbers} of {len(descriptions)} entries quantify their impact."


def _score_verbs(resume: Resume) -> tuple[int, str]:
    bullets = [line for d in _describables(resume) for line in _lines(d)]

    if not bullets:
        return 0, "No bullet points to assess."

    strong = sum(1 for b in bullets if b.split()[0].strip(",.").lower() in ACTION_VERBS)
    ratio = strong / len(bullets)

    if ratio >= 0.75:
        return 10, f"{strong} of {len(bullets)} bullets open with a strong action verb."
    if ratio >= 0.4:
        return 5, f"Only {strong} of {len(bullets)} bullets open with a strong action verb."
    return 0, "Bullets rarely open with an action verb. Start with Built, Developed, Designed."


def _score_education(resume: Resume) -> tuple[int, str]:
    complete = [e for e in resume.education if e.college.strip() and e.degree.strip()]

    if not complete:
        partial = [e for e in resume.education if e.college.strip() or e.degree.strip()]
        if partial:
            return 4, "Education is incomplete — add both the institution and the degree."
        return 0, "No education listed."

    dated = [e for e in complete if e.startYear.strip() or e.endYear.strip()]
    if dated:
        return 10, "Education is complete with dates."
    return 7, "Education is listed but has no years."


def _score_achievements(resume: Resume) -> tuple[int, str]:
    count = len(resume.achievement_titles())
    if count:
        return 5, f"{count} achievement{'s' if count != 1 else ''} / certification{'s' if count != 1 else ''} listed."
    return 0, "No achievements or certifications. Optional, but they help when relevant."


# name, max points, scorer
CRITERIA = [
    ("Contact details", 10, _score_contact),
    ("Professional summary", 15, _score_summary),
    ("Skills", 15, _score_skills),
    ("Experience & projects", 20, _score_depth),
    ("Measurable impact", 15, _score_impact),
    ("Strong action verbs", 10, _score_verbs),
    ("Education", 10, _score_education),
    ("Achievements & certifications", 5, _score_achievements),
]


def score_resume(resume: Resume) -> tuple[int, list[dict]]:
    """Return the total score out of 100 and the per-criterion breakdown."""
    breakdown = []
    total = 0

    for name, maximum, scorer in CRITERIA:
        points, detail = scorer(resume)
        points = max(0, min(points, maximum))
        total += points
        breakdown.append({"name": name, "score": points, "max": maximum, "detail": detail})

    return total, breakdown
