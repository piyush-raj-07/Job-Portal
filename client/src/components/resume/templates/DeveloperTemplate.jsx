/* eslint-disable react/prop-types */
"use client"

import { Sheet, Bullets, EmptyHint, Link } from "./templateParts"
import {
  filledEducation, filledExperience, filledProjects, filledAchievements,
  isResumeEmpty, contactValues, linkValues,
} from "./templateUtils"

/* Developer — monospace accents, skills as chips, projects promoted above
   experience. Built for early-career engineers whose projects are the story. */

const Section = ({ title, children }) => (
  <section className="mt-5">
    <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-900 mb-2.5">
      <span className="text-violet-600">#</span> {title}
    </h2>
    {children}
  </section>
)

const DeveloperTemplate = ({ data }) => {
  const { personalInfo, summary, skills } = data
  const education = filledEducation(data.education)
  const experience = filledExperience(data.experience)
  const projects = filledProjects(data.projects)
  const achievements = filledAchievements(data.achievements)
  const contacts = [...contactValues(personalInfo), ...linkValues(personalInfo)]

  return (
    <Sheet>
      <header className="border-l-4 border-violet-600 pl-3">
        <h1 className={`text-2xl font-bold tracking-tight ${personalInfo.fullName ? "text-slate-900" : "text-slate-300"}`}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        {contacts.length > 0 && (
          <p className="mt-1 font-mono text-[10px] text-slate-600 leading-relaxed break-all">
            {contacts.map((value, i) => (
              <span key={i}>
                {i > 0 && "  |  "}
                {linkValues(personalInfo).includes(value) ? <Link url={value} /> : value}
              </span>
            ))}
          </p>
        )}
      </header>

      {isResumeEmpty(data) && <EmptyHint />}

      {summary && (
        <Section title="about">
          <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{summary}</p>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="stack">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="font-mono text-[10px] px-2 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="projects">
          <div className="space-y-3">
            {projects.map((project, i) => (
              <div key={i}>
                <h3 className="text-[12px] font-semibold text-slate-900">
                  {project.name || "Project"}
                  {(project.github || project.link) && (
                    <span className="font-mono font-normal text-[10px] text-violet-700 ml-2">
                      {project.github && <Link url={project.github}>code</Link>}
                      {project.github && project.link && " / "}
                      {project.link && <Link url={project.link}>live</Link>}
                    </span>
                  )}
                </h3>
                {project.technologies.length > 0 && (
                  <p className="font-mono text-[10px] text-violet-700 mt-0.5">
                    {project.technologies.join(" / ")}
                  </p>
                )}
                <Bullets text={project.description} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="experience">
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[12px] font-semibold text-slate-900">
                    {exp.role || "Role"}
                    {exp.company && <span className="font-normal text-slate-600"> @ {exp.company}</span>}
                  </h3>
                  {(exp.startDate || exp.endDate) && (
                    <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
                    </span>
                  )}
                </div>
                <Bullets text={exp.description} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="education">
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[12px] font-semibold text-slate-900">
                    {edu.college || "College / University"}
                  </h3>
                  {(edu.degree || edu.field) && (
                    <p className="text-[11px] text-slate-600">
                      {[edu.degree, edu.field].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                {(edu.startYear || edu.endYear) && (
                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                    {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="achievements">
          <ul className="space-y-0.5 list-disc list-outside pl-4 marker:text-violet-500">
            {achievements.map((achievement, i) => (
              <li key={i} className="text-[11px] leading-relaxed text-slate-700">
                {achievement.title}
                {achievement.link && (
                  <span className="font-mono text-[10px] text-violet-700 ml-1.5">
                    <Link url={achievement.link} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Sheet>
  )
}

export default DeveloperTemplate
