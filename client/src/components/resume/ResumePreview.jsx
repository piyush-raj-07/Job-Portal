/* eslint-disable react/prop-types */
"use client"

import ModernTemplate from "./templates/ModernTemplate"
import ClassicTemplate from "./templates/ClassicTemplate"
import MinimalTemplate from "./templates/MinimalTemplate"
import DeveloperTemplate from "./templates/DeveloperTemplate"

/**
 * Read-only rendering of the resume. It holds no state of its own — every
 * value comes from the `data` prop, which is the parent's `resumeData`.
 *
 * The template only decides presentation. Switching it must never add, drop or
 * change a single field of the resume itself.
 */

const TEMPLATE_COMPONENTS = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  developer: DeveloperTemplate,
}

const ResumePreview = ({ data }) => {
  // An unknown template must still render something, not crash the page.
  const Template = TEMPLATE_COMPONENTS[data.template] || ModernTemplate
  return <Template data={data} />
}

export default ResumePreview
