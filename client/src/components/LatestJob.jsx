"use client"

import LatestJobCards from "./LatestJobCards"
import { useSelector } from "react-redux"
import { Briefcase, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job)
  const navigate = useNavigate()

  return (
    <section className="bg-[#080d1a] py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">Fresh Listings</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Latest <span className="gradient-text">Openings</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Handpicked opportunities updated daily</p>
          </div>
          <button
            onClick={() => navigate("/jobs")}
            className="mt-6 md:mt-0 flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 border border-violet-500/25 hover:border-violet-500/50 px-5 py-2.5 rounded-xl bg-violet-500/5 hover:bg-violet-500/10 transition-all"
          >
            Explore all jobs
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        {allJobs.length <= 0 ? (
          <div className="flex items-center justify-center py-24 rounded-2xl border border-white/5 bg-white/0">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-slate-500">No jobs available at the moment</p>
              <p className="text-slate-600 text-sm mt-1">Check back soon for new opportunities</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allJobs.slice(0, 6).map((job) => (
              <LatestJobCards key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* CTA if more */}
        {allJobs.length > 6 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => navigate("/jobs")}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl hover:bg-white/5 transition-all"
            >
              View {allJobs.length - 6} more jobs
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default LatestJobs
