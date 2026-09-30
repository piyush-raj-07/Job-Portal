/* eslint-disable react/prop-types */
"use client"

import { Wrench } from "lucide-react"
import { SectionCard, TagInput } from "./FormControls"

/**
 * @param values   resumeData.skills
 * @param onChange (nextArray) => void
 */
const SkillsForm = ({ values, onChange }) => (
  <SectionCard icon={Wrench} title="Skills" subtitle="Press Enter to add each skill">
    <TagInput values={values} onChange={onChange} placeholder="e.g. React, Node.js, MongoDB" />
  </SectionCard>
)

export default SkillsForm
