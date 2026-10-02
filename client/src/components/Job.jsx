"use client"

import { Button } from "./ui/button"
import { MapPin, Clock, Briefcase, DollarSign, Building, ArrowRight, Star } from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { useNavigate } from "react-router-dom"

const Job = ({ job, view = "grid" }) => {
  const navigate = useNavigate()

  const daysAgo = (t) => Math.floor((new Date() - new Date(t)) / (1000 * 24 * 60 * 60))
  const age = daysAgo(job?.createdAt)
  const isNew = age <= 2
  const initials = (job?.company?.name || "CO").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  /* ── List layout ── */
  if (view === "list") {
    return (
      <div className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5 transition-all duration-200">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 overflow-hidden">
          {job?.company?.logo
            ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-xl" />
            : initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate text-sm">
              {job?.title}
            </h3>
            {isNew && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
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
          <span className="text-slate-900 text-sm font-bold">{job?.salary}</span>
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />{age === 0 ? "Today" : `${age}d ago`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 h-8 rounded-xl flex items-center gap-1 shadow-sm shadow-blue-600/20"
          >
            Apply <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  /* ── Grid layout ── */
  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm card-hover flex flex-col overflow-hidden">
      {/* Hover shimmer */}
      <div className="absolute inset-x-0 top-0 h-1 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {age === 0 ? "Today" : `${age}d ago`}
          </div>
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Company + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0 overflow-hidden">
            {job?.company?.logo
              ? <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-xl" />
              : initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight line-clamp-1">
              {job?.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="h-3 w-3" />{job?.company?.name}
            </p>
          </div>
        </div>

        <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">{job?.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
            <MapPin className="h-2.5 w-2.5" />{job?.location || "Remote"}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {job?.jobType}
          </span>
          {job?.experienceLevel && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700">
              <Star className="h-2.5 w-2.5" />{job?.experienceLevel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <div className="flex-1 flex items-center">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-emerald-600" />{job?.salary}
            </span>
          </div>
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            variant="outline"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium px-3 h-8 rounded-xl"
          >
            Details
          </Button>
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 h-8 rounded-xl shadow-sm shadow-blue-600/20"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Job
