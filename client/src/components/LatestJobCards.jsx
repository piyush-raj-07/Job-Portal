"use client"
import { useNavigate } from "react-router-dom"
import { MapPin, Clock, Briefcase, Building } from "lucide-react"

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate()

  const daysAgo = () => {
    const createdAt = new Date(job?.createdAt)
    const currentTime = new Date()
    const timeDifference = currentTime - createdAt
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60))
  }

  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="group cursor-pointer bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-400" />
          <span className="font-semibold text-white group-hover:text-blue-500 transition-colors">
            {job?.company?.name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{daysAgo() === 0 ? "Today" : `${daysAgo()}d ago`}</span>
        </div>
      </div>

      <h3 className="font-bold text-xl text-white mb-3 group-hover:text-blue-500 transition-colors">{job?.title}</h3>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{job?.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/20 border border-blue-700/30 rounded-full text-xs text-blue-300">
          <MapPin className="h-3 w-3" />
          <span>{job?.location || "Remote"}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 rounded-full text-xs text-gray-300">
          <Briefcase className="h-3 w-3" />
          <span>{job?.jobType}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-amber-500">{job?.salary}LPA</span>
        <span className="text-xs text-gray-400">{job?.position} positions</span>
      </div>
    </div>
  )
}

export default LatestJobCards
