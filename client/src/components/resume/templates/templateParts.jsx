/* eslint-disable react/prop-types */
"use client"

/*
 * Shared components for every resume template.
 *
 * Templates differ only in presentation. They all read the same `data` object
 * and none of them may add, drop or alter a field — changing a template must
 * never change the resume.
 *
 * The pure helpers live in ./templateUtils.js.
 */

import { toBullets } from "./templateUtils"
import { toHref, toLinkLabel } from "../resumeSchema"

export const EmptyHint = () => (
  <p className="mt-10 text-center text-sm text-slate-400">
    Start filling the form — your resume appears here as you type.
  </p>
)

export const Bullets = ({ text, className = "text-[11px] leading-relaxed text-slate-700" }) => {
  const lines = toBullets(text)
  if (lines.length === 0) return null
  return (
    <ul className="mt-1 space-y-0.5 list-disc list-outside pl-4 marker:text-slate-400">
      {lines.map((line, i) => (
        <li key={i} className={className}>{line}</li>
      ))}
    </ul>
  )
}

/*
 * A real anchor, so the address is clickable in the preview and stays a live
 * hyperlink in the exported PDF — the browser's print engine preserves them.
 * An address that is not a plain http(s) URL renders as inert text.
 */
export const Link = ({ url, children, className = "" }) => {
  const href = toHref(url)
  const label = children || toLinkLabel(url)

  if (!label) return null
  if (!href) return <span className={className}>{label}</span>

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-slate-300 underline-offset-2 hover:decoration-current ${className}`}
    >
      {label}
    </a>
  )
}

/* The page itself. Every template renders inside one of these so the printed
   output is identical in size and padding whichever design is chosen, and so
   there is exactly one element for PDF export to target. */
export const Sheet = ({ children }) => (
  <div
    id="resume-print-area"
    className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-900/10 px-8 py-9 min-h-[520px] text-slate-800"
  >
    {children}
  </div>
)
