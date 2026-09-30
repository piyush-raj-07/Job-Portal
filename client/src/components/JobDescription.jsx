import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { setSingleJob } from "@/redux/jobSlice"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import {
  Briefcase, MapPin, DollarSign, Users, Clock, GraduationCap,
  Building, ArrowLeft, Calendar, CheckCircle2, Send, Share2,
  Bookmark, ExternalLink, Star, Zap,
} from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import ApplicationFormModal from "./ApplicationFormModal"
import Navbar from "./shared/Navbar"

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.auth)
  const isInitiallyApplied =
    singleJob?.applications?.some((app) => app.applicant === user?._id) || false

  const [isApplied, setIsApplied] = useState(isInitiallyApplied)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const BASE_URL = import.meta.env.VITE_API_BASE_URL
  const params = useParams()
  const jobId = params.id
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleApplyClick = () => {
    if (!user) { toast.error("Please login to apply"); navigate("/login"); return }
    setIsModalOpen(true)
  }

  const applyJobHandler = async (formData) => {
    setIsSubmitting(true)
    try {
      const data = new FormData()
      data.append("phoneNumber", formData.phoneNumber)
      data.append("yearsOfExperience", formData.yearsOfExperience)
      if (formData.useExistingResume) data.append("useExistingResume", "true")
      else data.append("resume", formData.resumeFile)

      const res = await axios.post(`${BASE_URL}/api/v1/application/apply/${jobId}`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (res.data.success) {
        setIsApplied(true)
        setIsModalOpen(false)
        dispatch(setSingleJob({
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        }))
        toast.success(res.data.message || "Applied Successfully!")
      }
    } catch (error) {
      if (error.response?.status === 401) { toast.error("Please login to apply"); navigate("/login") }
      else if (error.response?.data?.message?.includes("already applied")) {
        toast.error("You have already applied"); setIsApplied(true); setIsModalOpen(false)
      } else toast.error(error.response?.data?.message || "Failed to apply")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/job/findJobById/${jobId}`, { withCredentials: true })
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job))
          setIsApplied(res.data.job.applications.some((a) => a.applicant === user?._id))
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load job")
      }
    }
    fetch()
  }, [jobId, dispatch, user?._id])

  const daysAgo = singleJob?.createdAt
    ? Math.floor((new Date() - new Date(singleJob.createdAt)) / (1000 * 24 * 60 * 60))
    : null

  const initials = (singleJob?.company?.name || "CO")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const highlights = [
    { icon: MapPin, label: "Location", value: singleJob?.location || "Remote", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { icon: Briefcase, label: "Job Type", value: singleJob?.jobType, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { icon: DollarSign, label: "Salary", value: singleJob?.salary, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { icon: GraduationCap, label: "Experience", value: singleJob?.experienceLevel, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ]

  return (
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />

      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={applyJobHandler}
        isSubmitting={isSubmitting}
      />

      {/* Ambient glow */}
      <div className="fixed top-24 left-1/5 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-24 right-1/5 w-72 h-72 bg-indigo-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 relative z-10">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ── Hero card ── */}
        <div className="bg-[#0e1529] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 mb-6">

          {/* Purple top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600" />

          <div className="p-7 sm:p-10">
            {/* Company + Title row */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                {/* Company logo / avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-900/40 overflow-hidden">
                    {singleJob?.company?.logo
                      ? <img src={singleJob.company.logo} alt="" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  {daysAgo !== null && daysAgo <= 2 && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded-full border border-[#080d1a]">
                      NEW
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                    {singleJob?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-violet-400" />
                      {singleJob?.company?.name}
                    </span>
                    {daysAgo !== null && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {daysAgo === 0 ? "Posted today" : `Posted ${daysAgo}d ago`}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {singleJob?.applications?.length || 0} applicants
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-2.5 rounded-xl border transition-all ${isSaved
                    ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                    : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"}`}
                  title="Save job"
                >
                  <Bookmark className={`h-4.5 w-4.5 ${isSaved ? "fill-violet-400" : ""}`} />
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!") }}
                  className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all"
                  title="Share"
                >
                  <Share2 className="h-4.5 w-4.5" />
                </button>
                <Button
                  onClick={isApplied ? undefined : handleApplyClick}
                  disabled={isApplied}
                  className={`px-6 h-11 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${isApplied
                    ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                    : "gradient-purple hover:opacity-90 text-white shadow-lg shadow-violet-900/40 glow-purple"}`}
                >
                  {isApplied
                    ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Applied</>
                    : <><Send className="h-4 w-4" /> Apply Now</>}
                </Button>
              </div>
            </div>

            {/* ── Highlights grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {highlights.map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`rounded-2xl border ${bg} p-4 flex flex-col gap-1.5`}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-medium">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    {label}
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body: 2-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Description (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About the role */}
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-7 shadow-lg shadow-black/30">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-900/30">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">About the Role</h2>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-line">
                {singleJob?.description || "No description provided."}
              </p>
            </div>

            {/* Requirements (if skills / requirements exist — graceful fallback) */}
            {singleJob?.requirements && (
              <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-7 shadow-lg shadow-black/30">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Requirements</h2>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-line">
                  {singleJob.requirements}
                </p>
              </div>
            )}

            {/* Bottom apply CTA */}
            <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Ready to apply?</h3>
                <p className="text-slate-400 text-sm">
                  {isApplied
                    ? "You've already submitted your application. Good luck! 🎉"
                    : "Join the team — submit your application in under 2 minutes."}
                </p>
              </div>
              <Button
                onClick={isApplied ? undefined : handleApplyClick}
                disabled={isApplied}
                size="lg"
                className={`px-8 h-11 rounded-xl font-semibold text-sm flex items-center gap-2 flex-shrink-0 transition-all ${isApplied
                  ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  : "gradient-purple hover:opacity-90 text-white shadow-lg shadow-violet-900/40"}`}
              >
                {isApplied
                  ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Applied</>
                  : <><Send className="h-4 w-4" /> Apply for this Job</>}
              </Button>
            </div>
          </div>

          {/* ── Right: Sidebar (1/3) ── */}
          <div className="space-y-5">

            {/* Job Details card */}
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-6 shadow-lg shadow-black/30">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">Job Details</h3>
              <div className="space-y-4">
                {[
                  { icon: Users, label: "Open Positions", value: singleJob?.position, color: "text-violet-400", iconBg: "bg-violet-500/10" },
                  { icon: Calendar, label: "Date Posted", value: singleJob?.createdAt?.split("T")[0], color: "text-indigo-400", iconBg: "bg-indigo-500/10" },
                  { icon: Clock, label: "Your Status", value: isApplied ? "Applied ✓" : "Not Applied", color: isApplied ? "text-emerald-400" : "text-slate-400", iconBg: isApplied ? "bg-emerald-500/10" : "bg-white/5" },
                  { icon: Users, label: "Total Applicants", value: `${singleJob?.applications?.length || 0} people`, color: "text-amber-400", iconBg: "bg-amber-500/10" },
                ].map(({ icon: Icon, label, value, color, iconBg }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                      <p className={`text-sm font-semibold ${color === "text-slate-400" ? "text-white" : color}`}>
                        {value || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company card */}
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-6 shadow-lg shadow-black/30">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">About the Company</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md shadow-violet-900/30 overflow-hidden">
                  {singleJob?.company?.logo
                    ? <img src={singleJob.company.logo} alt="" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{singleJob?.company?.name}</p>
                  {singleJob?.company?.website && (
                    <a
                      href={singleJob.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-400 text-xs flex items-center gap-1 hover:text-violet-300 transition-colors"
                    >
                      Visit website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              {singleJob?.company?.description && (
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-4 mt-2">
                  {singleJob.company.description}
                </p>
              )}
            </div>

            {/* Quick apply CTA (sidebar) */}
            {!isApplied && (
              <button
                onClick={handleApplyClick}
                className="w-full gradient-purple hover:opacity-90 text-white rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 glow-purple transition-all"
              >
                <Send className="h-4 w-4" />
                Quick Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDescription