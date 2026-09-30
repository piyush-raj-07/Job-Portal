"""
resume_schema.py — The resume shape, mirrored from the React form.

These models match client/src/components/resume/resumeSchema.js and
backend/models/resume.model.js field for field. Every field has a default so a
half-filled resume is still a valid request, and `extra="ignore"` lets the Node
backend forward a mongo document (with _id, userId, timestamps) unchanged.
"""
from pydantic import BaseModel, ConfigDict, Field


class _Base(BaseModel):
    model_config = ConfigDict(extra="ignore")


class PersonalInfo(_Base):
    fullName: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""


class Education(_Base):
    college: str = ""
    degree: str = ""
    field: str = ""
    startYear: str = ""
    endYear: str = ""


class Experience(_Base):
    company: str = ""
    role: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""


class Project(_Base):
    name: str = ""
    technologies: list[str] = Field(default_factory=list)
    description: str = ""
    github: str = ""
    link: str = ""


class Achievement(_Base):
    title: str = ""
    link: str = ""


class Resume(_Base):
    title: str = ""
    personalInfo: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    education: list[Education] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    achievements: list[Achievement] = Field(default_factory=list)
    # Old field, replaced by achievements. Still read for old resumes.
    certifications: list[str] = Field(default_factory=list)
    template: str = "modern"

    def achievement_titles(self) -> list[str]:
        """Achievements (and any old certifications) as plain text lines."""
        titles = [a.title.strip() for a in self.achievements if a.title.strip()]
        titles += [c.strip() for c in self.certifications if c.strip()]
        return titles

    def has_content(self) -> bool:
        """True when there is anything real to write a summary from."""
        return bool(
            self.skills
            or self.achievement_titles()
            or any(e.college or e.degree or e.field for e in self.education)
            or any(x.company or x.role or x.description for x in self.experience)
            or any(p.name or p.description or p.technologies for p in self.projects)
        )


class SummaryRequest(_Base):
    resume: Resume = Field(default_factory=Resume)
    # Optional steer, e.g. "Backend Developer". Never treated as a fact about
    # the candidate — only as the kind of role the summary should aim at.
    targetRole: str = ""


class SummaryResponse(_Base):
    summary: str
    model: str


class ProjectDescriptionRequest(_Base):
    project: Project = Field(default_factory=Project)
    # The candidate's wider skill list, used for wording only — never treated
    # as a fact about this particular project.
    skills: list[str] = Field(default_factory=list)


class ProjectDescriptionResponse(_Base):
    description: str
    model: str


class ReviewRequest(_Base):
    resume: Resume = Field(default_factory=Resume)


class CriterionScore(_Base):
    name: str
    score: int
    max: int
    detail: str


class ReviewResponse(_Base):
    score: int
    breakdown: list[CriterionScore] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    issues: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    model: str


class JobPosting(_Base):
    """One job from the portal, flattened by the Node backend."""
    title: str = ""
    company: str = ""
    description: str = ""
    requirements: list[str] = Field(default_factory=list)
    location: str = ""
    jobType: str = ""
    experienceLevel: str = ""


class AtsRequest(_Base):
    resume: Resume = Field(default_factory=Resume)
    job: JobPosting = Field(default_factory=JobPosting)


class AtsResponse(_Base):
    matchScore: int
    matchedSkills: list[str] = Field(default_factory=list)
    missingSkills: list[str] = Field(default_factory=list)
    underusedSkills: list[str] = Field(default_factory=list)
    breakdown: list[CriterionScore] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    model: str
