"""
resume_writer.py — Prompts for the professional summary generator.

The whole design goal here is groundedness. The model is given a closed list of
facts and told, repeatedly and specifically, that anything outside that list is
off limits. Vague instructions like "be accurate" do not prevent invented
employers and metrics; naming the exact failure modes does.
"""
from app.schemas.resume_schema import Resume

SUMMARY_SYSTEM_PROMPT = """You write professional resume summaries.

You will be given a FACTS block listing everything known about one candidate.
That block is the complete and only source of truth about this person.

ABSOLUTE RULES
1. Use only facts stated in the FACTS block. If it is not written there, it is
   not true and must not appear.
2. Never invent employers, job titles, dates, degrees, certifications, team
   sizes, user counts, percentages, or any other number.
3. Never claim years of professional experience unless the FACTS block lists
   work experience with dates that support it.
4. Never describe the candidate as "expert", "seasoned", "extensive" or
   "highly experienced" unless the listed experience clearly justifies it. For
   a candidate whose facts are mostly education and personal projects, write
   like an early-career candidate.
5. Only name technologies that appear in the FACTS block.
6. If a TARGET ROLE is given, orient the wording toward it, but do not claim
   any skill or experience for that role that the FACTS block does not show.

STYLE
- 2 to 4 sentences, 40 to 80 words, one paragraph.
- Third person with the subject dropped: "Full-stack developer who builds…",
  never "I am" and never the candidate's name.
- Concrete and plain. No "passionate", "results-driven", "dynamic",
  "detail-oriented", "team player", or similar filler.
- Present tense.

OUTPUT
Return only the summary paragraph. No heading, no label, no quotation marks,
no markdown, no commentary."""


def _format_education(resume: Resume) -> list[str]:
    lines = []
    for item in resume.education:
        parts = [p for p in (item.degree, item.field) if p]
        qualification = " in ".join(parts) if len(parts) == 2 else (parts[0] if parts else "")
        span = " to ".join(p for p in (item.startYear, item.endYear) if p)
        pieces = [p for p in (qualification, item.college, span) if p]
        if pieces:
            lines.append(" — ".join(pieces))
    return lines


def _format_experience(resume: Resume) -> list[str]:
    lines = []
    for item in resume.experience:
        header = " at ".join(p for p in (item.role, item.company) if p)
        span = " to ".join(p for p in (item.startDate, item.endDate) if p)
        if span:
            header = f"{header} ({span})" if header else span
        if item.description:
            detail = " ".join(item.description.split())
            header = f"{header}: {detail}" if header else detail
        if header:
            lines.append(header)
    return lines


def _format_projects(resume: Resume) -> list[str]:
    lines = []
    for item in resume.projects:
        header = item.name or "Untitled project"
        if item.technologies:
            header += f" [built with: {', '.join(item.technologies)}]"
        if item.description:
            header += f": {' '.join(item.description.split())}"
        lines.append(header)
    return lines


def _section(title: str, lines: list[str], empty_note: str) -> str:
    if not lines:
        return f"{title}:\n  {empty_note}"
    body = "\n".join(f"  - {line}" for line in lines)
    return f"{title}:\n{body}"


def build_summary_prompt(resume: Resume, target_role: str = "") -> str:
    """Render the closed FACTS block the model must stay inside."""
    education = _format_education(resume)
    experience = _format_experience(resume)
    projects = _format_projects(resume)

    blocks = [
        _section("SKILLS", list(resume.skills), "NONE LISTED"),
        _section("EDUCATION", education, "NONE LISTED"),
        # Spelled out explicitly: this is the fact most often hallucinated into
        # a summary as "N years of experience".
        _section(
            "WORK EXPERIENCE",
            experience,
            "NONE — this candidate has no professional work experience. "
            "Do not imply any, and do not state any number of years.",
        ),
        _section("PROJECTS", projects, "NONE LISTED"),
        _section("ACHIEVEMENTS / CERTIFICATIONS", resume.achievement_titles(), "NONE LISTED"),
    ]

    facts = "\n\n".join(blocks)

    target = target_role.strip()
    target_line = (
        f"\n\nTARGET ROLE: {target}\n"
        "Orient the wording toward this role using only the facts above."
        if target
        else ""
    )

    return (
        "FACTS BLOCK (the complete truth about this candidate):\n\n"
        f"{facts}"
        f"{target_line}\n\n"
        "Write the professional summary now, following every rule."
    )


PROJECT_SYSTEM_PROMPT = """You rewrite rough project notes into resume bullet points.

You will be given one project exactly as its author described it. That
description is the complete and only source of truth about the project.

ABSOLUTE RULES
1. Every bullet must be supported by the author's own description. Rewriting
   and sharpening their words is the job; adding new facts is not.
2. NEVER invent numbers. No user counts, no percentages, no load times, no
   team sizes, no revenue, no "improved performance by 40%". If the author did
   not give a number, no number appears.
3. Never invent features, integrations, awards, deployments or outcomes that
   the description does not mention.
4. Only name technologies listed in TECHNOLOGIES, or ones the author names in
   the description itself.
5. Do not claim the project was used in production, by a company, or by real
   users unless the description says so.

STYLE
- 2 to 3 bullets. One line each, no sub-bullets.
- Start every bullet with a strong past-tense verb: Developed, Built,
  Implemented, Designed, Integrated, Automated, Architected.
- Say what was built and how it works, naming the real technologies.
- Plain and concrete. No "cutting-edge", "robust", "seamless", "leveraged".
- Roughly 12 to 25 words per bullet.

OUTPUT
Return only the bullets, one per line, each starting with "• ". No heading,
no blank lines, no commentary, no markdown."""


def build_project_prompt(project, skills: list[str] | None = None) -> str:
    """Render the closed description of one project."""
    technologies = ", ".join(project.technologies) if project.technologies else "NONE LISTED"

    # The candidate's overall skills are context for wording only, never facts
    # about this particular project.
    skill_line = ", ".join(skills or []) or "NONE LISTED"

    description = " ".join((project.description or "").split()) or "NONE PROVIDED"

    return (
        "PROJECT (the complete truth about this project):\n\n"
        f"NAME: {project.name or 'Untitled project'}\n"
        f"TECHNOLOGIES: {technologies}\n"
        f"AUTHOR'S DESCRIPTION: {description}\n\n"
        f"(The candidate's wider skill list, for wording only — do not claim "
        f"any of these were used in this project unless the description says "
        f"so: {skill_line})\n\n"
        "Rewrite this into resume bullets now, following every rule."
    )


# Appended on a retry when the model invented numbers that were not in the input.
INVENTED_NUMBERS_CORRECTION = """

IMPORTANT CORRECTION: your previous attempt contained numbers that the author
never provided ({numbers}). Rewrite the bullets using no statistics, metrics,
percentages or counts at all unless the exact figure appears in the author's
description."""


# Appended on a retry when the first attempt broke the no-experience rule.
NO_EXPERIENCE_CORRECTION = """

IMPORTANT CORRECTION: your previous attempt claimed a length of professional
experience. This candidate has NO work experience listed. Rewrite the summary
with no mention of years of experience and no implication of past employment.
Describe them through their skills, education and projects instead."""
