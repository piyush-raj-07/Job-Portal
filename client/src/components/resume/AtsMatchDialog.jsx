/* eslint-disable react/prop-types */
"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Sparkles, Loader2, CheckCircle2, XCircle, Lightbulb, ArrowLeft, Copy, Briefcase,
} from "lucide-react"

/* Colour follows the score so the headline number reads at a glance. */
const scoreTone = (score) => {
  if (score >= 75) return { text: "text-emerald-600", ring: "stroke-emerald-500" }
  if (score >= 50) return { text: "text-amber-600", ring: "stroke-amber-500" }
  return { text: "text-red-600", ring: "stroke-red-500" }
}

const ScoreRing = ({ score }) => {
  const tone = scoreTone(score)
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const filled = (Math.max(0, Math.min(score, 100)) / 100) * circumference

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} className="stroke-slate-200" strokeWidth="8" fill="none" />
        <circle
          cx="55" cy="55" r={radius} className={tone.ring} strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-extrabold ${tone.text}`}>{score}</span>
        <span className="text-[10px] text-slate-500">match</span>
      </div>
    </div>
  )
}

const SkillChips = ({ items, tone }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((skill, i) => (
      <span key={i} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${tone}`}>
        {skill}
      </span>
    ))}
  </div>
)

const AtsMatchDialog = ({
  open, onClose, jobs, loading, result, selectedJob,
  onRunMatch, onSaveTailoredCopy, saving,
}) => {
  const [query, setQuery] = useState("")

  const visibleJobs = jobs.filter((job) => {
    const text = `${job.title} ${job.company?.name || ""} ${job.location || ""}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  })

  const showingResult = Boolean(result) || loading

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="bg-white border border-slate-200 text-slate-900 rounded-3xl sm:max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl shadow-slate-900/10">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {showingResult ? "Resume vs. this job" : "Tailor for a job"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {showingResult
              ? selectedJob
                ? `${selectedJob.title}${selectedJob.company?.name ? ` — ${selectedJob.company.name}` : ""}`
                : "Matching your resume against the posting."
              : "Pick a job from the portal to see how well your resume matches it."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Job picker ── */}
        {!showingResult && (
          <div className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs by title, company or location"
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 rounded-xl h-11"
            />

            {jobs.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-10">
                No jobs available to match against yet.
              </p>
            )}

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {visibleJobs.map((job) => (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => onRunMatch(job)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {[job.company?.name, job.location, job.jobType].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Sparkles className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
              {jobs.length > 0 && visibleJobs.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No jobs match that search.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Matching your resume…
          </div>
        )}

        {/* ── Result ── */}
        {!loading && result && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={result.matchScore} />
              <div className="min-w-0 flex-1 space-y-2.5">
                {result.breakdown?.map((row) => {
                  const pct = row.max ? (row.score / row.max) * 100 : 0
                  const bar = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                  return (
                    <div key={row.name} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-medium text-slate-700">{row.name}</span>
                        <span className="text-[11px] text-slate-500">{row.score}/{row.max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{row.detail}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {result.matchedSkills?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Skills you already match ({result.matchedSkills.length})
                </h3>
                <SkillChips
                  items={result.matchedSkills}
                  tone="bg-emerald-50 border-emerald-200 text-emerald-700"
                />
              </div>
            )}

            {result.missingSkills?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                  Asked for, not on your resume ({result.missingSkills.length})
                </h3>
                <SkillChips
                  items={result.missingSkills}
                  tone="bg-red-50 border-red-200 text-red-700"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  These are shown so you know the gap. Never add a skill you do not have.
                </p>
              </div>
            )}

            {result.recommendations?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  How to tailor it
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onRunMatch(null)}
                className="border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl h-10"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Pick another job
              </Button>
              <Button
                type="button"
                onClick={onSaveTailoredCopy}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-semibold flex-1 sm:flex-none shadow-sm shadow-blue-600/20"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving copy…</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" />Save as tailored copy</>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 -mt-3">
              Creates a new resume for this job. Your original is never changed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AtsMatchDialog
