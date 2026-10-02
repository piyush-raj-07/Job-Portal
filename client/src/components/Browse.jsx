import { useEffect, useState, useMemo } from "react"
import Navbar from "./shared/Navbar"
import FilterCard from "./FilterCard"
import Job from "./Job"
import { useDispatch, useSelector } from "react-redux"
import { setSearchedQuery } from "@/redux/jobSlice"
import useGetAllJobs from "@/hooks/useGetAllJobs"
import {
  Search, X, Grid3X3, List, SlidersHorizontal,
  TrendingUp, Sparkles, ChevronDown
} from "lucide-react"
import { Button } from "./ui/button"

const Browse = () => {
  useGetAllJobs()

  const { allJobs } = useSelector((store) => store.job)
  const dispatch = useDispatch()

  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [activeFilters, setActiveFilters] = useState({})
  const [activeSalary, setActiveSalary] = useState([0, 50])

  useEffect(() => {
    return () => dispatch(setSearchedQuery(""))
  }, [])

  const filteredJobs = useMemo(() => {
    let jobs = [...allJobs]

    const keyword = searchInput.trim().toLowerCase()
    if (keyword) {
      jobs = jobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(keyword) ||
          job.description?.toLowerCase().includes(keyword) ||
          job.location?.toLowerCase().includes(keyword) ||
          job.company?.name?.toLowerCase().includes(keyword)
      )
    }

    if (activeFilters.location?.length) {
      jobs = jobs.filter((job) =>
        activeFilters.location.some((l) =>
          job.location?.toLowerCase().includes(l.toLowerCase())
        )
      )
    }

    if (activeFilters.jobType?.length) {
      jobs = jobs.filter((job) =>
        activeFilters.jobType.some((t) =>
          job.jobType?.toLowerCase().includes(t.toLowerCase())
        )
      )
    }

    if (activeSalary[1] < 50) {
      jobs = jobs.filter((job) => job.salary <= activeSalary[1])
    }

    if (sortBy === "newest") jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === "salary-high") jobs.sort((a, b) => b.salary - a.salary)
    else if (sortBy === "salary-low") jobs.sort((a, b) => a.salary - b.salary)

    return jobs
  }, [allJobs, searchInput, activeFilters, activeSalary, sortBy])

  const handleFilterChange = (filters, salary) => {
    setActiveFilters(filters)
    setActiveSalary(salary)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-2 tracking-widest uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Job Discovery
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Browse <span className="text-blue-600">Opportunities</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              {allJobs.length} jobs available — find your next move
            </p>
          </div>

          {/* Search + Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-3 text-slate-700 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
                >
                  <option value="newest">Newest</option>
                  <option value="salary-high">Salary ↑</option>
                  <option value="salary-low">Salary ↓</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-3 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-3 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter toggle (mobile) */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">{filteredJobs.length}</span>
            results
            {searchInput && (
              <span>for "<span className="text-slate-700">{searchInput}</span>"</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className={`w-72 flex-shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="sticky top-6">
              <FilterCard onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Jobs grid */}
          <main className="flex-1 min-w-0">
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500 text-sm text-center max-w-xs">
                  Try different keywords or clear your filters.
                </p>
                <Button
                  onClick={() => { setSearchInput(""); setActiveFilters({}); setActiveSalary([0, 50]) }}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl px-5 shadow-sm shadow-blue-600/20"
                >
                  Clear All
                </Button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {filteredJobs.map((job) => (
                  <Job key={job._id} job={job} viewMode={viewMode} />
                ))}
              </div>
            )}

            {filteredJobs.length > 0 && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-8 rounded-xl"
                >
                  Load More
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Browse