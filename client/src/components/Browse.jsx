import { useEffect } from "react"
import Navbar from "./shared/Navbar"
import Job from "./Job"
import { useDispatch, useSelector } from "react-redux"
import { setSearchedQuery } from "@/redux/jobSlice"
import useGetAllJobs from "@/hooks/useGetAllJobs"
import { Search, Filter, Grid, List } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"

const Browse = () => {
  useGetAllJobs()
  const { allJobs } = useSelector((store) => store.job)
  const dispatch = useDispatch()
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""))
    }
  }, [])

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Browse <span className="text-blue-500">Jobs</span>
          </h1>
          <p className="text-gray-400 mb-6">Discover your next career opportunity from our curated job listings</p>

          {/* Search and Filter Bar */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                  <Button
                    onClick={() => setViewMode("grid")}
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Search Results</h2>
            <p className="text-gray-400">
              {allJobs.length} {allJobs.length === 1 ? "job" : "jobs"} found
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Sort by:</span>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option>Most Recent</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
              <option>Company A-Z</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid/List */}
        {allJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
            <div className="p-4 rounded-full bg-gray-700 mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-gray-400 text-center max-w-md">
              We couldn't find any jobs matching your criteria. Try adjusting your search terms or filters.
            </p>
            <Button
              onClick={() => dispatch(setSearchedQuery(""))}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {allJobs.map((job) => (
              <Job key={job._id} job={job} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {allJobs.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-8 py-3"
            >
              Load More Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse
