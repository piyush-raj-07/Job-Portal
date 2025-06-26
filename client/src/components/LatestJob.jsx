"use client"

import LatestJobCards from "./LatestJobCards"
import { useSelector } from "react-redux"
import { Briefcase, TrendingUp } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job)
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-full bg-blue-900/30 text-blue-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-blue-500 font-medium">Featured Opportunities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Latest & Top <span className="text-blue-500">Job Openings</span>
            </h2>
          </div>
          <Button
            onClick={() => navigate("/browse")}
            className="mt-4 md:mt-0 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            View All Jobs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allJobs.length <= 0 ? (
            <div className="col-span-full flex items-center justify-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
              <div className="text-center">
                <div className="p-4 rounded-full bg-gray-700 inline-block mb-4">
                  <Briefcase className="h-12 w-12 text-gray-400" />
                </div>
                <span className="text-gray-300 text-lg">No jobs available at the moment</span>
              </div>
            </div>
          ) : (
            allJobs?.slice(0, 6).map((job) => <LatestJobCards key={job._id} job={job} />)
          )}
        </div>
      </div>
    </div>
  )
}

export default LatestJobs
