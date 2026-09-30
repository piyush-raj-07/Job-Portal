/* eslint-disable react/prop-types */
"use client"

import { User2 } from "lucide-react"
import { SectionCard, Field } from "./FormControls"

/**
 * @param data     resumeData.personalInfo
 * @param onChange (field, value) => void
 */
const PersonalInfoForm = ({ data, onChange }) => (
  <SectionCard icon={User2} title="Personal Information" subtitle="How recruiters reach you">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field
        label="Full Name"
        value={data.fullName}
        onChange={(v) => onChange("fullName", v)}
        placeholder="e.g. Piyush Raj"
      />
      <Field
        label="Email"
        type="email"
        value={data.email}
        onChange={(v) => onChange("email", v)}
        placeholder="you@example.com"
      />
      <Field
        label="Phone"
        value={data.phone}
        onChange={(v) => onChange("phone", v)}
        placeholder="+91 98765 43210"
      />
      <Field
        label="Location"
        value={data.location}
        onChange={(v) => onChange("location", v)}
        placeholder="e.g. Bangalore, India"
      />
      <Field
        label="LinkedIn"
        value={data.linkedin}
        onChange={(v) => onChange("linkedin", v)}
        placeholder="linkedin.com/in/username"
      />
      <Field
        label="GitHub"
        value={data.github}
        onChange={(v) => onChange("github", v)}
        placeholder="github.com/username"
      />
    </div>
  </SectionCard>
)

export default PersonalInfoForm
