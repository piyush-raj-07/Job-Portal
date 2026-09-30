/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from "react"
import Navbar from "../shared/Navbar"
import { Button } from "../ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui/dialog"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { FileText, Plus, Pencil, Trash2, Loader2, Clock, Star, Copy, Target } from "lucide-react"

import {
  getResumes, deleteResume, duplicateResume, setMasterResume,
} from "../../services/resumeApi"

/* "Today" / "Yesterday" / "12 Aug 2026" — resumes are edited often, so the
   recent cases are worth spelling out. */
const formatUpdated = (value) => {
  if (!value) return "Never"

  const updated = new Date(value)
  if (Number.isNaN(updated.getTime())) return "Unknown"

  // Compare calendar days, not raw timestamps, so "yesterday at 11pm" and
  // "today at 00:00" both land on the right label. Math.round absorbs DST.
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfUpdated = new Date(updated)
  startOfUpdated.setHours(0, 0, 0, 0)

  const daysAgo = Math.round((startOfToday - startOfUpdated) / 86400000)

  if (daysAgo <= 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  if (daysAgo < 7) return `${daysAgo} days ago`

  return updated.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

const ResumeCard = ({ resume, onEdit, onAskDelete, onDuplicate, onSetMaster, busy }) => (
  <div
    className={`bg-[#0e1529] border rounded-3xl p-6 shadow-2xl shadow-black/40 card-hover flex flex-col ${
      resume.isMaster ? "border-amber-500/30" : "border-white/5"
    }`}
  >
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-2xl gradient-purple flex items-center justify-center shadow-lg shadow-violet-900/40 flex-shrink-0">
        <FileText className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-extrabold text-white tracking-tight truncate" title={resume.title}>
          {resume.title}
        </h2>
        <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
          <Clock className="h-3 w-3" />
          Last updated: {formatUpdated(resume.updatedAt)}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5 mb-5">
      {resume.isMaster && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
          <Star className="h-3 w-3 fill-amber-300" /> Master
        </span>
      )}
      {resume.tailoredForJob?.jobTitle && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[11px] font-medium max-w-full"
          title={`Tailored for ${resume.tailoredForJob.jobTitle}`}
        >
          <Target className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Tailored: {resume.tailoredForJob.jobTitle}</span>
        </span>
      )}
      <span className="inline-block px-2.5 py-1 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-200 text-[11px] font-medium capitalize">
        {resume.template}
      </span>
    </div>

    <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
      <Button
        type="button"
        onClick={() => onEdit(resume._id)}
        className="flex-1 gradient-purple hover:opacity-90 text-white rounded-xl h-10 text-sm font-semibold"
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        title="Duplicate"
        disabled={busy}
        onClick={() => onDuplicate(resume)}
        className="border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl h-10 px-3"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      {!resume.isMaster && (
        <Button
          type="button"
          variant="outline"
          title="Set as master resume"
          disabled={busy}
          onClick={() => onSetMaster(resume)}
          className="border-white/10 bg-transparent hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-400 hover:text-amber-300 rounded-xl h-10 px-3"
        >
          <Star className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        title="Delete"
        onClick={() => onAskDelete(resume)}
        className="border-white/10 bg-transparent hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl h-10 px-3"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
)

const MyResumes = () => {
  const { user } = useSelector((store) => store.auth)
  const navigate = useNavigate()

  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to see your resumes")
      navigate("/login")
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const loadResumes = async () => {
      try {
        setLoading(true)
        const data = await getResumes()
        if (!cancelled) setResumes(data.resumes || [])
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || "Could not load your resumes")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResumes()
    return () => { cancelled = true }
  }, [user])

  /* Clones a resume so a tailored version never overwrites the original. */
  const handleDuplicate = async (resume) => {
    try {
      setBusy(true)
      const data = await duplicateResume(resume._id)
      setResumes((prev) => [data.resume, ...prev])
      toast.success(`Created "${data.resume.title}"`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not duplicate the resume")
    } finally {
      setBusy(false)
    }
  }

  /* Only one resume can be the master, so update every card locally. */
  const handleSetMaster = async (resume) => {
    try {
      setBusy(true)
      await setMasterResume(resume._id)
      setResumes((prev) =>
        prev.map((item) => ({ ...item, isMaster: item._id === resume._id }))
      )
      toast.success(`"${resume.title}" is now your master resume`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not set the master resume")
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return

    try {
      setDeleting(true)
      await deleteResume(pendingDelete._id)
      // Drop it locally rather than refetching the whole list.
      setResumes((prev) => prev.filter((item) => item._id !== pendingDelete._id))
      toast.success("Resume deleted")
      setPendingDelete(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete the resume")
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />
      <div className="fixed top-24 right-1/4 w-72 h-72 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">My Resumes</h1>
            <p className="text-slate-500 text-sm">
              {loading
                ? "Loading…"
                : `${resumes.length} saved resume${resumes.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate("/resume-builder")}
            className="gradient-purple hover:opacity-90 text-white rounded-xl h-11 px-5 font-semibold shadow-lg shadow-violet-900/30 flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> New Resume
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
            Loading your resumes…
          </div>
        )}

        {/* Empty */}
        {!loading && resumes.length === 0 && (
          <div className="bg-[#0e1529] border border-dashed border-white/10 rounded-3xl py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-900/40">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">No resumes yet</h2>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Build your first resume and it will show up here.
            </p>
            <Button
              type="button"
              onClick={() => navigate("/resume-builder")}
              className="gradient-purple hover:opacity-90 text-white rounded-xl h-11 px-6 font-semibold shadow-lg shadow-violet-900/30"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Resume
            </Button>
          </div>
        )}

        {/* List */}
        {!loading && resumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                busy={busy}
                onEdit={(id) => navigate(`/resume-builder/${id}`)}
                onAskDelete={setPendingDelete}
                onDuplicate={handleDuplicate}
                onSetMaster={handleSetMaster}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation — deleting a resume cannot be undone. */}
      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="bg-[#0e1529] border border-white/10 text-white rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this resume?</DialogTitle>
            <DialogDescription className="text-slate-400">
              &ldquo;{pendingDelete?.title}&rdquo; will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white rounded-xl h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 font-semibold"
            >
              {deleting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting…</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" />Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyResumes
