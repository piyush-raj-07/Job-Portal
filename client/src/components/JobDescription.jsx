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
  ExternalLink, Star, Zap,
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
    { icon: MapPin, label: "Location", value: singleJob?.location || "Remote", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { icon: Briefcase, label: "Job Type", value: singleJob?.jobType, color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
    { icon: DollarSign, label: "Salary", value: singleJob?.salary, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    { icon: GraduationCap, label: "Experience", value: singleJob?.experienceLevel, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={applyJobHandler}
        isSubmitting={isSubmitting}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 relative z-10">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-700 text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ── Hero card ── */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6">

          {/* Top accent bar */}
          <div className="h-1 w-full gradient-primary" />

          <div className="p-7 sm:p-10">
            {/* Company + Title row */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                {/* Company logo / avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg overflow-hidden">
                    {singleJob?.company?.logo
                      ? <img src={singleJob.company.logo} alt="" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  {daysAgo !== null && daysAgo <= 2 && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                      NEW
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                    {singleJob?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-blue-600" />
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
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!") }}
                  className="p-2.5 rounded-xl border bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  title="Share"
                >
                  <Share2 className="h-4.5 w-4.5" />
                </button>
                <Button
                  onClick={isApplied ? undefined : handleApplyClick}
                  disabled={isApplied}
                  className={`px-6 h-11 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${isApplied
                    ? "bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"}`}
                >
                  {isApplied
                    ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Applied</>
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
                  <p className="text-slate-900 font-semibold text-sm leading-snug">{value || "—"}</p>
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
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {singleJob?.description || "No description provided."}
              </p>
            </div>

            {/* Requirements (if skills / requirements exist — graceful fallback) */}
            {singleJob?.requirements && (
              <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-sky-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Requirements</h2>
                </div>
                {Array.isArray(singleJob.requirements) ? (
                  <div className="flex flex-wrap gap-2">
                    {singleJob.requirements.filter(Boolean).map((req, i) => (
                      <span key={`${req}-${i}`} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
                        {req}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                    {singleJob.requirements}
                  </p>
                )}
              </div>
            )}

            {/* Bottom apply CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1">
                <h3 className="text-slate-900 font-bold text-lg mb-1">Ready to apply?</h3>
                <p className="text-slate-600 text-sm">
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
                  ? "bg-white border border-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"}`}
              >
                {isApplied
                  ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Applied</>
                  : <><Send className="h-4 w-4" /> Apply for this Job</>}
              </Button>
            </div>
          </div>

          {/* ── Right: Sidebar (1/3) ── */}
          <div className="space-y-5">

            {/* Job Details card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-5">Job Details</h3>
              <div className="space-y-4">
                {[
                  { icon: Users, label: "Open Positions", value: singleJob?.position, color: "text-blue-600", iconBg: "bg-blue-50" },
                  { icon: Calendar, label: "Date Posted", value: singleJob?.createdAt?.split("T")[0], color: "text-sky-600", iconBg: "bg-sky-50" },
                  { icon: Clock, label: "Your Status", value: isApplied ? "Applied ✓" : "Not Applied", color: isApplied ? "text-emerald-600" : "text-slate-500", iconBg: isApplied ? "bg-emerald-50" : "bg-slate-100" },
                  { icon: Users, label: "Total Applicants", value: `${singleJob?.applications?.length || 0} people`, color: "text-amber-700", iconBg: "bg-amber-50" },
                ].map(({ icon: Icon, label, value, color, iconBg }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                      <p className={`text-sm font-semibold ${color === "text-slate-500" ? "text-slate-900" : color}`}>
                        {value || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">About the Company</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0 overflow-hidden">
                  {singleJob?.company?.logo
                    ? <img src={singleJob.company.logo} alt="" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{singleJob?.company?.name}</p>
                  {singleJob?.company?.website && (
                    <a
                      href={singleJob.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-xs flex items-center gap-1 hover:text-blue-700 transition-colors"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 transition-all"
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