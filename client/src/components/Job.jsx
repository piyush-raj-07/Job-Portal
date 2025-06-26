"use client"

import { Button } from "./ui/button"
import { Bookmark, MapPin, Clock, Briefcase, DollarSign, Building } from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const Job = ({ job }) => {
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime)
    const currentTime = new Date()
    const timeDifference = currentTime - createdAt
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60))
  }

  return (
    <div className="group bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-gray-700/50"
          onClick={() => setIsSaved(!isSaved)}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`} />
        </Button>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-12 w-12 rounded-lg bg-gray-700 border border-gray-600">
          <AvatarImage src={job?.company?.logo || "/placeholder.svg?height=48&width=48"} />
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-blue-500 transition-colors">
            {job?.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-400">
            <Building className="h-4 w-4" />
            <span className="text-sm">{job?.company?.name}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-6 line-clamp-2">{job?.description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/20 border border-blue-700/30 rounded-full text-xs text-blue-300">
          <MapPin className="h-3 w-3" />
          <span>{job?.location || "Remote"}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 rounded-full text-xs text-gray-300">
          <Briefcase className="h-3 w-3" />
          <span>{job?.jobType}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/20 border border-amber-700/30 rounded-full text-xs text-amber-300">
          <DollarSign className="h-3 w-3" />
          <span>{job?.salary}LPA</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
          className="flex-1 border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white"
        >
          View Details
        </Button>
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Apply Now
        </Button>
      </div>
    </div>
  )
}

export default Job
