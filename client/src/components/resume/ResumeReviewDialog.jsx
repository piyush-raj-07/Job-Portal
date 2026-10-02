/* eslint-disable react/prop-types */
"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../ui/dialog"
import { CheckCircle2, AlertTriangle, Lightbulb, Loader2 } from "lucide-react"

/* Colour follows the score so the headline number reads at a glance. */
const scoreTone = (score) => {
  if (score >= 80) return { text: "text-emerald-600", ring: "stroke-emerald-500", label: "Strong" }
  if (score >= 60) return { text: "text-amber-600", ring: "stroke-amber-500", label: "Decent" }
  return { text: "text-red-600", ring: "stroke-red-500", label: "Needs work" }
}

const ScoreRing = ({ score }) => {
  const tone = scoreTone(score)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const filled = (Math.max(0, Math.min(score, 100)) / 100) * circumference

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} className="stroke-slate-200" strokeWidth="9" fill="none" />
        <circle
          cx="60" cy="60" r={radius}
          className={tone.ring}
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-extrabold ${tone.text}`}>{score}</span>
        <span className="text-[10px] text-slate-500">out of 100</span>
      </div>
    </div>
  )
}

const CriterionRow = ({ row }) => {
  const pct = row.max ? (row.score / row.max) * 100 : 0
  const barTone = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-700">{row.name}</span>
        <span className="text-[11px] text-slate-500 flex-shrink-0">
          {row.score}/{row.max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">{row.detail}</p>
    </div>
  )
}

const FindingList = ({ icon: Icon, iconCls, title, items }) => {
  if (!items?.length) return null
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconCls}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * @param open     boolean
 * @param onClose  () => void
 * @param loading  boolean
 * @param review   { score, breakdown, strengths, issues, suggestions } | null
 */
const ResumeReviewDialog = ({ open, onClose, loading, review }) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent className="bg-white border border-slate-200 text-slate-900 rounded-3xl sm:max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl shadow-slate-900/10">
      <DialogHeader>
        <DialogTitle className="text-slate-900">Resume Review</DialogTitle>
        <DialogDescription className="text-slate-600">
          Scored against eight fixed criteria, then reviewed for wording.
        </DialogDescription>
      </DialogHeader>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Reviewing your resume…
        </div>
      )}

      {!loading && review && (
        <div className="space-y-7">

          {/* Score */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={review.score} />
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-sm text-slate-600">
                This score is calculated from the breakdown below, so it is the same
                every time for the same resume.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                {review.breakdown?.slice(0, 4).map((row) => (
                  <CriterionRow key={row.name} row={row} />
                ))}
              </div>
            </div>
          </div>

          {/* Remaining criteria */}
          {review.breakdown?.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
              {review.breakdown.slice(4).map((row) => (
                <CriterionRow key={row.name} row={row} />
              ))}
            </div>
          )}

          <div className="space-y-6 pt-2 border-t border-slate-100">
            <FindingList
              icon={CheckCircle2}
              iconCls="text-emerald-600"
              title="Strengths"
              items={review.strengths}
            />
            <FindingList
              icon={AlertTriangle}
              iconCls="text-amber-600"
              title="Improvements"
              items={review.issues}
            />
            <FindingList
              icon={Lightbulb}
              iconCls="text-blue-600"
              title="Suggestions"
              items={review.suggestions}
            />
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
)

export default ResumeReviewDialog
