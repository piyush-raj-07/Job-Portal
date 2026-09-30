/* eslint-disable react/prop-types */
"use client"

import { FileText, Sparkles, Loader2, Undo2 } from "lucide-react"
import { Button } from "../ui/button"
import { SectionCard, AreaField } from "./FormControls"

/**
 * @param value      resumeData.summary
 * @param onChange   (value) => void
 * @param onGenerate () => void — asks the backend for an AI summary
 * @param generating boolean
 * @param onUndo     () => void — restores the text replaced by the last generate
 * @param canUndo    boolean
 */
const SummaryForm = ({ value, onChange, onGenerate, generating, onUndo, canUndo }) => (
  <SectionCard icon={FileText} title="Professional Summary" subtitle="2–4 lines about you">
    <AreaField
      label="Summary"
      value={value}
      onChange={onChange}
      placeholder="Full-stack developer with hands-on experience building MERN applications…"
      hint={`${value.length} characters`}
    />

    <div className="flex flex-wrap items-center gap-2 mt-3">
      <Button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        className="gradient-purple hover:opacity-90 text-white rounded-xl h-10 px-4 text-sm font-semibold shadow-lg shadow-violet-900/30"
      >
        {generating ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Writing…</>
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" />Generate with AI</>
        )}
      </Button>

      {canUndo && !generating && (
        <Button
          type="button"
          variant="outline"
          onClick={onUndo}
          className="border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl h-10 px-3 text-sm"
        >
          <Undo2 className="h-3.5 w-3.5 mr-1.5" /> Undo
        </Button>
      )}

      <span className="text-[11px] text-slate-600">
        Written only from your skills, education, experience and projects.
      </span>
    </div>
  </SectionCard>
)

export default SummaryForm
