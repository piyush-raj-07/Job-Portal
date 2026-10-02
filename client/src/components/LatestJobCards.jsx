"use client"
import { useNavigate } from "react-router-dom"
import { MapPin, Clock, DollarSign, ArrowRight } from "lucide-react"

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate()

  const daysAgo = () => {
    const diff = new Date() - new Date(job?.createdAt)
    return Math.floor(diff / (1000 * 24 * 60 * 60))
  }

  const age = daysAgo()
  const initials = (job?.company?.name || "CO")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 shadow-sm card-hover relative overflow-hidden"
    >
      {/* Hover shimmer */}
      <div className="absolute inset-x-0 top-0 h-1 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          {/* Company avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 overflow-hidden">
              {job?.company?.logo
                ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                : initials
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {job?.company?.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {age === 0 ? "Today" : `${age}d ago`}
              </div>
            </div>
          </div>

          {age <= 2 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">
          {job?.title}
        </h3>
        <p className="text-slate-600 text-xs mb-4 line-clamp-2 leading-relaxed">{job?.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
            <MapPin className="h-2.5 w-2.5" />{job?.location || "Remote"}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {job?.jobType}
          </span>
          {job?.experienceLevel && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700">
              {job?.experienceLevel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm font-bold text-slate-900">{job?.salary}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
            View details <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default LatestJobCards
