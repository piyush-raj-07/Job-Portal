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
      className="group cursor-pointer bg-[#0e1529] border border-white/5 rounded-2xl p-5 card-hover relative overflow-hidden"
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          {/* Company avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-violet-900/30">
              {job?.company?.logo
                ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                : initials
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                {job?.company?.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {age === 0 ? "Today" : `${age}d ago`}
              </div>
            </div>
          </div>

          {age <= 2 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-white mb-2 group-hover:text-violet-200 transition-colors line-clamp-1">
          {job?.title}
        </h3>
        <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">{job?.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/10 text-violet-400">
            <MapPin className="h-2.5 w-2.5" />{job?.location || "Remote"}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-400">
            {job?.jobType}
          </span>
          {job?.experienceLevel && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/10 text-indigo-400">
              {job?.experienceLevel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-sm font-bold text-amber-400">{job?.salary}</span>
          <span className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-violet-400 transition-colors">
            View details <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default LatestJobCards
