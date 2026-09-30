"use client"

import { Button } from "./ui/button"
import { Bookmark, MapPin, Clock, Briefcase, DollarSign, Building, ArrowRight, Star } from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const Job = ({ job, view = "grid" }) => {
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)

  const daysAgo = (t) => Math.floor((new Date() - new Date(t)) / (1000 * 24 * 60 * 60))
  const age = daysAgo(job?.createdAt)
  const isNew = age <= 2
  const initials = (job?.company?.name || "CO").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  /* ── List layout ── */
  if (view === "list") {
    return (
      <div className="group flex items-center gap-4 bg-[#0e1529] border border-white/5 rounded-2xl px-5 py-4 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-900/10 transition-all duration-200">
        <div className="w-11 h-11 rounded-xl gradient-purple flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-violet-900/30">
          {job?.company?.logo
            ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-xl" />
            : initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate text-sm">
              {job?.title}
            </h3>
            {isNew && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 flex-shrink-0">
                NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Building className="h-3 w-3" />{job?.company?.name}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job?.location || "Remote"}</span>
            <span className="hidden sm:flex items-center gap-1"><Briefcase className="h-3 w-3" />{job?.jobType}</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-amber-400 text-sm font-bold">{job?.salary}</span>
          <span className="text-slate-600 text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />{age === 0 ? "Today" : `${age}d ago`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-violet-500 text-violet-500" : ""}`} />
          </button>
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            className="gradient-purple hover:opacity-90 text-white text-xs px-4 h-8 rounded-xl flex items-center gap-1 shadow-md shadow-violet-900/30"
          >
            Apply <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  /* ── Grid layout ── */
  return (
    <div className="group relative bg-[#0e1529] border border-white/5 rounded-2xl p-5 card-hover flex flex-col overflow-hidden">
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Clock className="h-3 w-3" />
            {age === 0 ? "Today" : `${age}d ago`}
          </div>
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                NEW
              </span>
            )}
            <button
              className="p-1.5 rounded-lg text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-violet-500 text-violet-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Company + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md shadow-violet-900/30">
            {job?.company?.logo
              ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-xl" />
              : initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white group-hover:text-violet-200 transition-colors leading-tight line-clamp-1">
              {job?.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="h-3 w-3" />{job?.company?.name}
            </p>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">{job?.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/10 text-violet-400">
            <MapPin className="h-2.5 w-2.5" />{job?.location || "Remote"}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-400">
            {job?.jobType}
          </span>
          {job?.experienceLevel && (
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/10 text-indigo-400">
              <Star className="h-2.5 w-2.5" />{job?.experienceLevel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-white/5">
          <div className="flex-1 flex items-center">
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />{job?.salary}
            </span>
          </div>
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            variant="outline"
            className="border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs px-3 h-8 rounded-xl"
          >
            Details
          </Button>
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            className="gradient-purple hover:opacity-90 text-white text-xs px-4 h-8 rounded-xl shadow-md shadow-violet-900/30"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Job
