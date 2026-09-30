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
  if (score >= 75) return { text: "text-emerald-400", ring: "stroke-emerald-400" }
  if (score >= 50) return { text: "text-amber-400", ring: "stroke-amber-400" }
  return { text: "text-red-400", ring: "stroke-red-400" }
}

const ScoreRing = ({ score }) => {
  const tone = scoreTone(score)
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const filled = (Math.max(0, Math.min(score, 100)) / 100) * circumference

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} className="stroke-white/10" strokeWidth="8" fill="none" />
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
      <DialogContent className="bg-[#0e1529] border border-white/10 text-white rounded-3xl sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {showingResult ? "Resume vs. this job" : "Tailor for a job"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
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
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 rounded-xl h-11"
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
                  className="w-full text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-600/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-violet-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {[job.company?.name, job.location, job.jobType].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Sparkles className="h-4 w-4 text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1" />
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
            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
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
                  const bar = pct >= 75 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400"
                  return (
                    <div key={row.name} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-medium text-slate-300">{row.name}</span>
                        <span className="text-[11px] text-slate-500">{row.score}/{row.max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Skills you already match ({result.matchedSkills.length})
                </h3>
                <SkillChips
                  items={result.matchedSkills}
                  tone="bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                />
              </div>
            )}

            {result.missingSkills?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  Asked for, not on your resume ({result.missingSkills.length})
                </h3>
                <SkillChips
                  items={result.missingSkills}
                  tone="bg-red-500/10 border-red-500/25 text-red-300"
                />
                <p className="text-[11px] text-slate-600 mt-2">
                  These are shown so you know the gap. Never add a skill you do not have.
                </p>
              </div>
            )}

            {result.recommendations?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  How to tailor it
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-300 leading-relaxed">
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-violet-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onRunMatch(null)}
                className="border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl h-10"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Pick another job
              </Button>
              <Button
                type="button"
                onClick={onSaveTailoredCopy}
                disabled={saving}
                className="gradient-purple hover:opacity-90 text-white rounded-xl h-10 font-semibold flex-1 sm:flex-none"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving copy…</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" />Save as tailored copy</>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-slate-600 -mt-3">
              Creates a new resume for this job. Your original is never changed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AtsMatchDialog
