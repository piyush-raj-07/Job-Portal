/* eslint-disable react/prop-types */
"use client"

import { Trophy } from "lucide-react"
import { SectionCard, Field, RepeatItem, EmptyState } from "./FormControls"

/**
 * @param items    resumeData.achievements
 * @param onAdd    () => void
 * @param onRemove (index) => void
 * @param onChange (index, field, value) => void
 */
const AchievementsForm = ({ items, onAdd, onRemove, onChange }) => (
  <SectionCard
    icon={Trophy}
    title="Achievements"
    subtitle="Awards, rankings, certifications, publications"
    onAdd={onAdd}
    addLabel="Add"
  >
    <div className="space-y-4">
      {items.length === 0 && <EmptyState text="No achievements added yet." />}
      {items.map((achievement, index) => (
        <RepeatItem key={index} index={index} label="Achievement" onRemove={() => onRemove(index)}>
          <Field
            label="Achievement"
            value={achievement.title}
            onChange={(v) => onChange(index, "title", v)}
            placeholder="e.g. Winner, Smart India Hackathon 2024"
          />
          <Field
            label="Link (optional)"
            value={achievement.link}
            onChange={(v) => onChange(index, "link", v)}
            placeholder="e.g. certificate or article URL"
          />
        </RepeatItem>
      ))}
    </div>
  </SectionCard>
)

export default AchievementsForm
