/* eslint-disable react/prop-types */
"use client"

import { Briefcase } from "lucide-react"
import { SectionCard, Field, AreaField, RepeatItem, EmptyState } from "./FormControls"

/**
 * @param items    resumeData.experience
 * @param onAdd    () => void
 * @param onRemove (index) => void
 * @param onChange (index, field, value) => void
 */
const ExperienceForm = ({ items, onAdd, onRemove, onChange }) => (
  <SectionCard
    icon={Briefcase}
    title="Experience"
    subtitle="Internships and jobs"
    onAdd={onAdd}
    addLabel="Add"
  >
    <div className="space-y-4">
      {items.length === 0 && <EmptyState text="No experience added yet — that is fine for freshers." />}
      {items.map((exp, index) => (
        <RepeatItem key={index} index={index} label="Experience" onRemove={() => onRemove(index)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Company"
              value={exp.company}
              onChange={(v) => onChange(index, "company", v)}
              placeholder="e.g. Infosys"
            />
            <Field
              label="Role"
              value={exp.role}
              onChange={(v) => onChange(index, "role", v)}
              placeholder="e.g. Frontend Developer Intern"
            />
            <Field
              label="Start Date"
              value={exp.startDate}
              onChange={(v) => onChange(index, "startDate", v)}
              placeholder="e.g. Jun 2024"
            />
            <Field
              label="End Date"
              value={exp.endDate}
              onChange={(v) => onChange(index, "endDate", v)}
              placeholder="e.g. Aug 2024 or Present"
            />
          </div>
          <AreaField
            label="Description"
            value={exp.description}
            onChange={(v) => onChange(index, "description", v)}
            placeholder="What you worked on and what it achieved…"
          />
        </RepeatItem>
      ))}
    </div>
  </SectionCard>
)

export default ExperienceForm
