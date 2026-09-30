/* eslint-disable react/prop-types */
"use client"

import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from "lucide-react"
import { Sheet, Bullets, EmptyHint, Link } from "./templateParts"
import {
  filledEducation, filledExperience, filledProjects, filledAchievements,
  isResumeEmpty, contactValues, linkValues,
} from "./templateUtils"

/* Modern — centred header, violet section rules, icon contact line. */

const Section = ({ title, children }) => (
  <section className="mt-5">
    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-slate-300 pb-1 mb-2.5">
      {title}
    </h2>
    {children}
  </section>
)

const ContactBit = ({ icon: Icon, value, asLink }) =>
  value ? (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3 text-slate-500 flex-shrink-0" />
      {asLink ? <Link url={value} className="break-all" /> : <span className="break-all">{value}</span>}
    </span>
  ) : null

const ProjectLinks = ({ project }) => {
  if (!project.github && !project.link) return null
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-violet-700 ml-2">
      {project.github && (
        <span className="inline-flex items-center gap-1">
          <Github className="h-2.5 w-2.5 flex-shrink-0" />
          <Link url={project.github}>Code</Link>
        </span>
      )}
      {project.link && (
        <span className="inline-flex items-center gap-1">
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
          <Link url={project.link}>Live</Link>
        </span>
      )}
    </span>
  )
}

const ModernTemplate = ({ data }) => {
  const { personalInfo, summary, skills } = data
  const education = filledEducation(data.education)
  const experience = filledExperience(data.experience)
  const projects = filledProjects(data.projects)
  const achievements = filledAchievements(data.achievements)

  return (
    <Sheet>
      <header className="text-center">
        <h1 className={`text-2xl font-bold tracking-tight ${personalInfo.fullName ? "text-slate-900" : "text-slate-300"}`}>
          {personalInfo.fullName || "Your Name"}
        </h1>

        {contactValues(personalInfo).length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            <ContactBit icon={Mail} value={personalInfo.email} />
            <ContactBit icon={Phone} value={personalInfo.phone} />
            <ContactBit icon={MapPin} value={personalInfo.location} />
          </div>
        )}

        {linkValues(personalInfo).length > 0 && (
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            <ContactBit icon={Linkedin} value={personalInfo.linkedin} asLink />
            <ContactBit icon={Github} value={personalInfo.github} asLink />
          </div>
        )}
      </header>

      {isResumeEmpty(data) && <EmptyHint />}

      {summary && (
        <Section title="Professional Summary">
          <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">{summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[12px] font-semibold text-slate-900">
                    {exp.role || "Role"}
                    {exp.company && <span className="font-normal text-slate-600"> — {exp.company}</span>}
                  </h3>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
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

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {projects.map((project, i) => (
              <div key={i}>
                <h3 className="text-[12px] font-semibold text-slate-900">
                  {project.name || "Project"}
                  <ProjectLinks project={project} />
                </h3>
                {project.technologies.length > 0 && (
                  <p className="text-[10px] italic text-slate-500 mt-0.5">
                    {project.technologies.join(" · ")}
                  </p>
                )}
                <Bullets text={project.description} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2.5">
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
                  <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                    {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <p className="text-[11px] leading-relaxed text-slate-700">{skills.join(" · ")}</p>
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="space-y-0.5 list-disc list-outside pl-4 marker:text-slate-400">
            {achievements.map((achievement, i) => (
              <li key={i} className="text-[11px] leading-relaxed text-slate-700">
                {achievement.title}
                {achievement.link && (
                  <span className="text-[10px] text-violet-700 ml-1.5">
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

export default ModernTemplate
