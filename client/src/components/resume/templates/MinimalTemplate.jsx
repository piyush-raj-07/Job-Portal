/* eslint-disable react/prop-types */
"use client"

import { Sheet, Bullets, EmptyHint, Link } from "./templateParts"
import {
  filledEducation, filledExperience, filledProjects, filledAchievements,
  isResumeEmpty, contactValues, linkValues,
} from "./templateUtils"

/* Minimal — left-aligned, no rules, no colour. Whitespace does the work. */

const Section = ({ title, children }) => (
  <section className="mt-6">
    <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
      {title}
    </h2>
    {children}
  </section>
)

const MinimalTemplate = ({ data }) => {
  const { personalInfo, summary, skills } = data
  const education = filledEducation(data.education)
  const experience = filledExperience(data.experience)
  const projects = filledProjects(data.projects)
  const achievements = filledAchievements(data.achievements)
  const contacts = [...contactValues(personalInfo), ...linkValues(personalInfo)]

  return (
    <Sheet>
      <header>
        <h1 className={`text-xl font-medium tracking-tight ${personalInfo.fullName ? "text-slate-900" : "text-slate-300"}`}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        {contacts.length > 0 && (
          <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
            {contacts.map((value, i) => (
              <span key={i}>
                {i > 0 && "   "}
                {linkValues(personalInfo).includes(value) ? <Link url={value} /> : value}
              </span>
            ))}
          </p>
        )}
      </header>

      {isResumeEmpty(data) && <EmptyHint />}

      {summary && (
        <Section title="About">
          <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i}>
                <h3 className="text-[12px] text-slate-900">
                  <span className="font-medium">{exp.role || "Role"}</span>
                  {exp.company && <span className="text-slate-500">, {exp.company}</span>}
                </h3>
                {(exp.startDate || exp.endDate) && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
                  </p>
                )}
                <Bullets text={exp.description} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i}>
                <h3 className="text-[12px] font-medium text-slate-900">
                  {project.name || "Project"}
                  {(project.github || project.link) && (
                    <span className="font-normal text-[10px] text-slate-400 ml-2">
                      {project.github && <Link url={project.github}>Code</Link>}
                      {project.github && project.link && " · "}
                      {project.link && <Link url={project.link}>Live</Link>}
                    </span>
                  )}
                </h3>
                {project.technologies.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{project.technologies.join(", ")}</p>
                )}
                <Bullets text={project.description} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i}>
                <h3 className="text-[12px] text-slate-900">
                  <span className="font-medium">
                    {[edu.degree, edu.field].filter(Boolean).join(", ") || "Degree"}
                  </span>
                  {edu.college && <span className="text-slate-500">, {edu.college}</span>}
                </h3>
                {(edu.startYear || edu.endYear) && (
                  <p className="text-[10px] text-slate-400">
                    {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <p className="text-[11px] leading-relaxed text-slate-700">{skills.join(", ")}</p>
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          <div className="space-y-1">
            {achievements.map((achievement, i) => (
              <p key={i} className="text-[11px] leading-relaxed text-slate-700">
                {achievement.title}
                {achievement.link && (
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    <Link url={achievement.link} />
                  </span>
                )}
              </p>
            ))}
          </div>
        </Section>
      )}
    </Sheet>
  )
}

export default MinimalTemplate
