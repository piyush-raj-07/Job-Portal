"use client"

import { useState, useEffect, useRef } from "react"
import Navbar from "../shared/Navbar"
import { Button } from "../ui/button"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save, Loader2, Sparkles, Download, Target } from "lucide-react"

import useGetAllJobs from "../../hooks/useGetAllJobs"
import {
  INITIAL_RESUME, EMPTY_EDUCATION, EMPTY_EXPERIENCE, EMPTY_PROJECT, EMPTY_ACHIEVEMENT,
  toFormState,
} from "./resumeSchema"
import {
  createResume, getResumeById, updateResume,
  generateSummary, improveProjectDescription, reviewResume,
  matchResumeToJob, duplicateResume,
} from "../../services/resumeApi"
import "./resumePrint.css"
import { Field } from "./FormControls"
import PersonalInfoForm from "./PersonalInfoForm"
import SummaryForm from "./SummaryForm"
import EducationForm from "./EducationForm"
import ExperienceForm from "./ExperienceForm"
import ProjectsForm from "./ProjectsForm"
import SkillsForm from "./SkillsForm"
import AchievementsForm from "./AchievementsForm"
import ResumePreview from "./ResumePreview"
import { TEMPLATES } from "./templates/templateUtils"
import ResumeReviewDialog from "./ResumeReviewDialog"
import AtsMatchDialog from "./AtsMatchDialog"

/**
 * Parent container for the resume builder.
 * It owns the one and only copy of `resumeData` — every section component is
 * presentational and reports changes back through the handlers below.
 */
const ResumeBuilder = () => {
  const { user } = useSelector((store) => store.auth)
  const navigate = useNavigate()
  const { id: routeResumeId } = useParams()

  // Populates store.job.allJobs, which the tailoring dialog picks from.
  useGetAllJobs()
  const { allJobs } = useSelector((store) => store.job)

  const [resumeData, setResumeData] = useState(INITIAL_RESUME)
  const [resumeId, setResumeId] = useState(null)
  const [loading, setLoading] = useState(Boolean(routeResumeId))
  const [saving, setSaving] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)

  // Whatever the last AI generation replaced, so it can be put back.
  const [previousSummary, setPreviousSummary] = useState(null)

  // Project description improver: which index is running, and what it replaced.
  const [improvingProject, setImprovingProject] = useState(null)
  const [previousProject, setPreviousProject] = useState({ index: null, description: "" })

  // Resume review
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [review, setReview] = useState(null)

  // Job tailoring
  const [atsOpen, setAtsOpen] = useState(false)
  const [matching, setMatching] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [matchedJob, setMatchedJob] = useState(null)
  const [savingCopy, setSavingCopy] = useState(false)

  // Which id is already in `resumeData`. Kept in a ref so that navigating to
  // the new resume's URL right after saving does not trigger a refetch.
  const loadedIdRef = useRef(null)

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to build your resume")
      navigate("/login")
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return

    // No id in the URL — this is a blank new resume.
    if (!routeResumeId) {
      loadedIdRef.current = null
      setResumeId(null)
      setResumeData(INITIAL_RESUME)
      setLoading(false)
      return
    }

    // Already holding this resume (we just saved it), so skip the fetch.
    if (loadedIdRef.current === routeResumeId) return

    let cancelled = false

    const loadResume = async () => {
      try {
        setLoading(true)
        const data = await getResumeById(routeResumeId)
        if (cancelled) return
        setResumeData(toFormState(data.resume))
        setResumeId(data.resume._id)
        loadedIdRef.current = data.resume._id
      } catch (error) {
        if (cancelled) return
        toast.error(error.response?.data?.message || "Could not load that resume")
        navigate("/resume-builder", { replace: true })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResume()
    return () => { cancelled = true }
  }, [routeResumeId, user, navigate])

  /* ── Generic state updaters shared by every section ── */
  const setTitle = (value) => setResumeData((prev) => ({ ...prev, title: value }))

  const updatePersonalInfo = (field, value) =>
    setResumeData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }))

  const updateSection = (section, value) =>
    setResumeData((prev) => ({ ...prev, [section]: value }))

  const addItem = (section, template) =>
    setResumeData((prev) => ({ ...prev, [section]: [...prev[section], { ...template }] }))

  const removeItem = (section, index) =>
    setResumeData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }))

  const updateItem = (section, index, field, value) =>
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))

  /* Asks the backend (which asks the Python AI service) for a summary built
     from this resume's own facts. The result lands in the form for the user
     to edit or undo — it is never saved on their behalf. */
  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true)
      const data = await generateSummary(resumeData)
      setPreviousSummary(resumeData.summary)
      updateSection("summary", data.summary)
      toast.success("Summary generated — edit it to sound like you")
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not generate a summary")
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleUndoSummary = () => {
    if (previousSummary === null) return
    updateSection("summary", previousSummary)
    setPreviousSummary(null)
    toast.success("Previous summary restored")
  }

  /* Rewrites one project's rough notes into resume bullets. */
  const handleImproveProject = async (index) => {
    const project = resumeData.projects[index]
    if (!project) return

    try {
      setImprovingProject(index)
      const data = await improveProjectDescription(project, resumeData.skills)
      setPreviousProject({ index, description: project.description })
      updateItem("projects", index, "description", data.description)
      toast.success("Project description improved")
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not improve that description")
    } finally {
      setImprovingProject(null)
    }
  }

  const handleUndoProject = (index) => {
    if (previousProject.index !== index) return
    updateItem("projects", index, "description", previousProject.description)
    setPreviousProject({ index: null, description: "" })
    toast.success("Previous description restored")
  }

  /* Scores the resume and lists what to fix. Nothing is changed or saved. */
  const handleReview = async () => {
    try {
      setReviewOpen(true)
      setReviewing(true)
      const data = await reviewResume(resumeData)
      setReview(data)
    } catch (error) {
      setReviewOpen(false)
      toast.error(error.response?.data?.message || "Could not review the resume")
    } finally {
      setReviewing(false)
    }
  }

  /* Matches the resume against one job. Passing null returns to the picker. */
  const handleRunMatch = async (job) => {
    if (!job) {
      setMatchResult(null)
      setMatchedJob(null)
      return
    }

    try {
      setMatchedJob(job)
      setMatching(true)
      const data = await matchResumeToJob(resumeData, job._id)
      setMatchResult(data)
    } catch (error) {
      setMatchedJob(null)
      toast.error(error.response?.data?.message || "Could not match this resume to the job")
    } finally {
      setMatching(false)
    }
  }

  /* Saves a copy tailored to the matched job. The original is untouched —
     if this resume has never been saved, the copy is created from scratch. */
  const handleSaveTailoredCopy = async () => {
    if (!matchedJob) return

    const jobLabel = matchedJob.company?.name
      ? `${matchedJob.title} — ${matchedJob.company.name}`
      : matchedJob.title
    const tailoredForJob = {
      jobId: matchedJob._id,
      jobTitle: matchedJob.title || "",
      companyName: matchedJob.company?.name || "",
    }

    try {
      setSavingCopy(true)

      // An unsaved resume has nothing to clone on the server, so create the
      // copy directly from what is currently in the form.
      const data = resumeId
        ? await duplicateResume(resumeId, { title: jobLabel, tailoredForJob })
        : await createResume({ ...resumeData, title: jobLabel })

      toast.success(`Saved as "${data.resume.title}"`)
      setAtsOpen(false)
      navigate(`/resume-builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the tailored copy")
    } finally {
      setSavingCopy(false)
    }
  }

  /* Opens the browser's print dialog with only the resume sheet visible, so
     the saved PDF keeps real selectable text that ATS parsers can read. */
  const handleDownloadPdf = () => {
    const name = resumeData.personalInfo.fullName?.trim() || resumeData.title || "Resume"
    const previousTitle = document.title

    // Most browsers use document.title as the suggested PDF filename.
    document.title = name.replace(/[\\/:*?"<>|]/g, "-")

    const restore = () => {
      document.title = previousTitle
      window.removeEventListener("afterprint", restore)
    }
    window.addEventListener("afterprint", restore)

    window.print()

    // Safari never fires afterprint reliably; restore anyway.
    setTimeout(restore, 3000)
  }

  /* Creates on first save, updates from then on. */
  const saveResume = async () => {
    if (!resumeData.title.trim()) {
      toast.error("Give your resume a title before saving")
      return
    }

    try {
      setSaving(true)

      if (resumeId) {
        await updateResume(resumeId, resumeData)
        toast.success("Resume updated")
        return
      }

      const data = await createResume(resumeData)
      const newId = data.resume._id
      loadedIdRef.current = newId
      setResumeId(newId)
      // Keep the URL editable/shareable without pushing a extra history entry.
      navigate(`/resume-builder/${newId}`, { replace: true })
      toast.success("Resume saved")
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the resume")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center gap-3 py-32 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading your resume…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed top-24 right-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        <button
          onClick={() => navigate("/my-resumes")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-700 text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Resumes
        </button>

        {/* Page header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Builder</h1>
            <p className="text-slate-500 text-sm">
              {resumeId ? "Editing a saved resume." : "Fill in your details, then save."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              onClick={handleDownloadPdf}
              variant="outline"
              className="border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl h-11 px-4"
            >
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
            <Button
              type="button"
              onClick={() => setAtsOpen(true)}
              variant="outline"
              className="border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-blue-700 hover:text-blue-800 rounded-xl h-11 px-4 font-semibold"
            >
              <Target className="h-4 w-4 mr-2" /> Tailor for a Job
            </Button>
            <Button
              type="button"
              onClick={handleReview}
              disabled={reviewing}
              variant="outline"
              className="border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-blue-700 hover:text-blue-800 rounded-xl h-11 px-4 font-semibold"
            >
              {reviewing ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Reviewing…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Review My Resume</>
              )}
            </Button>
            <Button
              type="button"
              onClick={saveResume}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 font-semibold shadow-sm shadow-blue-600/20"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{resumeId ? "Update Resume" : "Save Resume"}</>
              )}
            </Button>
          </div>
        </div>

        {/* Form on the left, live preview on the right. Both read the same
            `resumeData` — the preview keeps no copy of its own. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left column: the form ── */}
          <div className="space-y-6">

            {/* Resume title */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
              <Field
                label="Resume Title"
                value={resumeData.title}
                onChange={setTitle}
                placeholder="e.g. React Developer Resume"
              />
            </div>

            <PersonalInfoForm data={resumeData.personalInfo} onChange={updatePersonalInfo} />

            <SummaryForm
              value={resumeData.summary}
              onChange={(v) => updateSection("summary", v)}
              onGenerate={handleGenerateSummary}
              generating={generatingSummary}
              onUndo={handleUndoSummary}
              canUndo={previousSummary !== null}
            />

            <EducationForm
              items={resumeData.education}
              onAdd={() => addItem("education", EMPTY_EDUCATION)}
              onRemove={(index) => removeItem("education", index)}
              onChange={(index, field, value) => updateItem("education", index, field, value)}
            />

            <ExperienceForm
              items={resumeData.experience}
              onAdd={() => addItem("experience", EMPTY_EXPERIENCE)}
              onRemove={(index) => removeItem("experience", index)}
              onChange={(index, field, value) => updateItem("experience", index, field, value)}
            />

            <ProjectsForm
              items={resumeData.projects}
              onAdd={() => addItem("projects", EMPTY_PROJECT)}
              onRemove={(index) => removeItem("projects", index)}
              onChange={(index, field, value) => updateItem("projects", index, field, value)}
              onImprove={handleImproveProject}
              improving={improvingProject}
              onUndo={handleUndoProject}
              undoable={previousProject.index}
            />

            <SkillsForm values={resumeData.skills} onChange={(v) => updateSection("skills", v)} />

            <AchievementsForm
              items={resumeData.achievements}
              onAdd={() => addItem("achievements", EMPTY_ACHIEVEMENT)}
              onRemove={(index) => removeItem("achievements", index)}
              onChange={(index, field, value) => updateItem("achievements", index, field, value)}
            />

          </div>

          {/* ── Right column: live preview ── */}
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Preview
              </span>
              {/* Template changes presentation only — never the resume data. */}
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.value}
                    type="button"
                    title={template.hint}
                    onClick={() => updateSection("template", template.value)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                      resumeData.template === template.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-slate-900"
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Light "desk" behind the white sheet so the preview reads as a document. */}
            <div className="lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto rounded-2xl bg-slate-100 border border-slate-200 p-4 sm:p-6">
              <ResumePreview data={resumeData} />
            </div>
          </div>

        </div>
      </div>

      <ResumeReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        loading={reviewing}
        review={review}
      />

      <AtsMatchDialog
        open={atsOpen}
        onClose={() => setAtsOpen(false)}
        jobs={allJobs || []}
        loading={matching}
        result={matchResult}
        selectedJob={matchedJob}
        onRunMatch={handleRunMatch}
        onSaveTailoredCopy={handleSaveTailoredCopy}
        saving={savingCopy}
      />
    </div>
  )
}

export default ResumeBuilder
