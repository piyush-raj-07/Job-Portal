"use client"

import LatestJobCards from "./LatestJobCards"
import { useSelector } from "react-redux"
import { Briefcase, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job)
  const navigate = useNavigate()

  return (
    <section className="bg-background py-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Fresh Listings</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Latest <span className="gradient-text">Openings</span>
            </h2>
            <p className="text-slate-600 text-sm mt-2">Handpicked opportunities updated daily</p>
          </div>
          <button
            onClick={() => navigate("/jobs")}
            className="mt-6 md:mt-0 flex items-center gap-2 text-sm font-semibold text-blue-700 border border-blue-200 hover:border-blue-300 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 shadow-sm transition-all"
          >
            Explore all jobs
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        {allJobs.length <= 0 ? (
          <div className="flex items-center justify-center py-24 rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-slate-700 font-medium">No jobs available at the moment</p>
              <p className="text-slate-500 text-sm mt-1">Check back soon for new opportunities</p>
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
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 bg-white px-6 py-3 rounded-xl hover:bg-blue-50 shadow-sm transition-all"
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
