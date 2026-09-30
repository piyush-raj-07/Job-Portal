/* eslint-disable react/prop-types */
"use client"

import { Sheet, Bullets, EmptyHint, Link } from "./templateParts"
import {
  filledEducation, filledExperience, filledProjects, filledAchievements,
  isResumeEmpty, contactValues, linkValues,
} from "./templateUtils"

/* Classic — serif, all-caps rules, the conventional single-column format most
   recruiters and ATS parsers expect. */

const Section = ({ title, children }) => (
  <section className="mt-5">
    <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900 border-b-2 border-slate-800 pb-1 mb-2.5">
      {title}
    </h2>
    {children}
  </section>
)

const ClassicTemplate = ({ data }) => {
  const { personalInfo, summary, skills } = data
  const education = filledEducation(data.education)
  const experience = filledExperience(data.experience)
  const projects = filledProjects(data.projects)
  const achievements = filledAchievements(data.achievements)
  const contacts = [...contactValues(personalInfo), ...linkValues(personalInfo)]

  return (
    <Sheet>
      <div className="font-serif">
        <header className="text-center border-b-2 border-slate-800 pb-3">
          <h1 className={`text-2xl font-bold tracking-wide uppercase ${personalInfo.fullName ? "text-slate-900" : "text-slate-300"}`}>
            {personalInfo.fullName || "Your Name"}
          </h1>
          {contacts.length > 0 && (
            <p className="mt-1.5 text-[11px] text-slate-700">
              {contacts.map((value, i) => (
                <span key={i}>
                  {i > 0 && "  •  "}
                  {linkValues(personalInfo).includes(value)
                    ? <Link url={value} />
                    : value}
                </span>
              ))}
            </p>
          )}
        </header>

        {isResumeEmpty(data) && <EmptyHint />}

        {summary && (
          <Section title="Objective">
            <p className="text-[11px] leading-relaxed text-slate-800 text-justify whitespace-pre-line">
              {summary}
            </p>
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Education">
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[12px] font-bold text-slate-900">
                      {edu.college || "College / University"}
                    </h3>
                    {(edu.degree || edu.field) && (
                      <p className="text-[11px] italic text-slate-700">
                        {[edu.degree, edu.field].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  {(edu.startYear || edu.endYear) && (
                    <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
                      {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Professional Experience">
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[12px] font-bold text-slate-900">{exp.company || "Company"}</h3>
                    {(exp.startDate || exp.endDate) && (
                      <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
                        {[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
                      </span>
                    )}
                  </div>
                  {exp.role && <p className="text-[11px] italic text-slate-700">{exp.role}</p>}
                  <Bullets text={exp.description} className="text-[11px] leading-relaxed text-slate-800" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Projects">
            <div className="space-y-3">
              {projects.map((project, i) => (
                <div key={i}>
                  <h3 className="text-[12px] font-bold text-slate-900">
                    {project.name || "Project"}
                    {project.technologies.length > 0 && (
                      <span className="font-normal italic text-slate-700">
                        {" "}— {project.technologies.join(", ")}
                      </span>
                    )}
                    {(project.github || project.link) && (
                      <span className="font-normal text-[10px] text-slate-700 ml-2">
                        {project.github && <Link url={project.github}>Code</Link>}
                        {project.github && project.link && " · "}
                        {project.link && <Link url={project.link}>Live</Link>}
                      </span>
                    )}
                  </h3>
                  <Bullets text={project.description} className="text-[11px] leading-relaxed text-slate-800" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Technical Skills">
            <p className="text-[11px] leading-relaxed text-slate-800">{skills.join(", ")}</p>
          </Section>
        )}

        {achievements.length > 0 && (
          <Section title="Achievements">
            <ul className="space-y-0.5 list-disc list-outside pl-4">
              {achievements.map((achievement, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-slate-800">
                  {achievement.title}
                  {achievement.link && (
                    <span className="text-[10px] text-slate-700 ml-1.5">
                      <Link url={achievement.link} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </Sheet>
  )
}

export default ClassicTemplate
