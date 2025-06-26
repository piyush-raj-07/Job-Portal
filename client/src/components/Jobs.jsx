"use client"

import { useEffect, useState } from "react"
import Navbar from "./shared/Navbar"
import FilterCard from "./FilterCard"
import Job from "./Job"
import { useSelector } from "react-redux"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "./ui/button"

const Jobs = () => {
  const { allJobs, searchedQuery } = useSelector((store) => store.job)
  const [filterJobs, setFilterJobs] = useState(allJobs)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchedQuery || "")

  useEffect(() => {
    if (searchedQuery) {
      setSearchInput(searchedQuery)
      const filteredJobs = allJobs.filter((job) => {
        return (
          job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchedQuery.toLowerCase())
        )
      })
      setFilterJobs(filteredJobs)
    } else {
      setFilterJobs(allJobs)
    }
  }, [allJobs, searchedQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
              Find Your Perfect Job
            </span>
          </h1>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, skills, or companies"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/50"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className={`md:w-1/4 lg:w-1/5 ${showFilters ? "block" : "hidden md:block"}`}>
            <FilterCard />
          </div>

          {/* Job listings */}
          <div className="flex-1">
            {filterJobs.length <= 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <div className="h-16 w-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-slate-400 text-center max-w-md">
                  We couldn't find any jobs matching your search criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filterJobs.map((job) => (
                  <Job key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jobs
