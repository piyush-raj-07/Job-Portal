/* eslint-disable react/prop-types */
"use client"

import { GraduationCap } from "lucide-react"
import { SectionCard, Field, RepeatItem, EmptyState } from "./FormControls"

/**
 * @param items    resumeData.education
 * @param onAdd    () => void
 * @param onRemove (index) => void
 * @param onChange (index, field, value) => void
 */
const EducationForm = ({ items, onAdd, onRemove, onChange }) => (
  <SectionCard
    icon={GraduationCap}
    title="Education"
    subtitle="Most recent first"
    onAdd={onAdd}
    addLabel="Add"
  >
    <div className="space-y-4">
      {items.length === 0 && <EmptyState text="No education added yet." />}
      {items.map((edu, index) => (
        <RepeatItem key={index} index={index} label="Education" onRemove={() => onRemove(index)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="College / University"
              value={edu.college}
              onChange={(v) => onChange(index, "college", v)}
              placeholder="e.g. IIT Patna"
            />
            <Field
              label="Degree"
              value={edu.degree}
              onChange={(v) => onChange(index, "degree", v)}
              placeholder="e.g. B.Tech"
            />
            <Field
              label="Field of Study"
              value={edu.field}
              onChange={(v) => onChange(index, "field", v)}
              placeholder="e.g. Computer Science"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Start Year"
                value={edu.startYear}
                onChange={(v) => onChange(index, "startYear", v)}
                placeholder="2021"
              />
              <Field
                label="End Year"
                value={edu.endYear}
                onChange={(v) => onChange(index, "endYear", v)}
                placeholder="2025"
              />
            </div>
          </div>
        </RepeatItem>
      ))}
    </div>
  </SectionCard>
)

export default EducationForm
