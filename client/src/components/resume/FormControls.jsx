/* eslint-disable react/prop-types */
// Shared presentational building blocks for the resume form sections.
// Kept in one module so every section card, field and chip input looks identical.
"use client"

import { useState } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { Plus, Trash2, X } from "lucide-react"

export const fieldCls =
  "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-xl h-11"
export const areaCls =
  "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-xl min-h-[96px] py-3"

/* Card wrapper with an icon header and an optional "Add" button */
export const SectionCard = ({ icon: Icon, title, subtitle, children, onAdd, addLabel }) => (
  <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40">
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-purple flex items-center justify-center shadow-lg shadow-violet-900/40 flex-shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        </div>
      </div>
      {onAdd && (
        <Button
          type="button"
          onClick={onAdd}
          className="gradient-purple hover:opacity-90 text-white rounded-xl h-9 px-3 text-xs font-semibold flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> {addLabel}
        </Button>
      )}
    </div>
    {children}
  </div>
)

export const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    <Label className="text-slate-300 text-sm font-medium">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldCls}
      placeholder={placeholder}
    />
  </div>
)

export const AreaField = ({ label, value, onChange, placeholder, hint }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label className="text-slate-300 text-sm font-medium">{label}</Label>
      {hint && <span className="text-[11px] text-slate-600">{hint}</span>}
    </div>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={areaCls}
      placeholder={placeholder}
    />
  </div>
)

/* Chip input used for skills, certifications and project technologies */
export const TagInput = ({ label, values, onChange, placeholder }) => {
  const [draft, setDraft] = useState("")

  const addTag = () => {
    const tag = draft.trim()
    if (!tag) return
    if (values.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      toast.error(`"${tag}" is already added`)
      setDraft("")
      return
    }
    onChange([...values, tag])
    setDraft("")
  }

  const removeTag = (index) => onChange(values.filter((_, i) => i !== index))

  return (
    <div className="space-y-2">
      {label && <Label className="text-slate-300 text-sm font-medium">{label}</Label>}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              addTag()
            }
          }}
          className={fieldCls}
          placeholder={placeholder}
        />
        <Button
          type="button"
          onClick={addTag}
          variant="outline"
          className="border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white rounded-xl h-11 px-4 flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-200 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-violet-400 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* Wrapper around one entry of a repeatable section */
export const RepeatItem = ({ index, label, onRemove, children }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label} {index + 1}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>
    {children}
  </div>
)

export const EmptyState = ({ text }) => (
  <p className="text-slate-600 text-sm text-center py-6 rounded-2xl border border-dashed border-white/5">
    {text}
  </p>
)
