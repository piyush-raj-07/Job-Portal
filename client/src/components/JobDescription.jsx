import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useParams } from "react-router-dom"
import axios from "axios"
import { setSingleJob } from "@/redux/jobSlice"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  GraduationCap,
  Building,
  Share2,
  ArrowLeft,
} from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { useNavigate } from "react-router-dom"

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.auth)
  const isIntiallyApplied = singleJob?.applications?.some((application) => application.applicant === user?._id) || false
  const [isApplied, setIsApplied] = useState(isIntiallyApplied)

  const params = useParams()
  const jobId = params.id
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // UPDATED APPLY JOB HANDLER WITH FIXES
  const applyJobHandler = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to apply for jobs")
      navigate("/login") // Update this path to your login route
      return
    }

    try {
      // Changed from GET to POST request
      const res = await axios.post(`http://localhost:3000/api/v1/application/apply/${jobId}`, {}, { withCredentials: true })

      if (res.data.success) {
        setIsApplied(true)
        const updatedSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        }
        dispatch(setSingleJob(updatedSingleJob))
        toast.success(res.data.message || "Applied Successfully")
      }
    } catch (error) {
      console.log(error)
      // Handle different error status codes
      if (error.response?.status === 401) {
        toast.error("Please login to apply for jobs")
        navigate("/login")
      } else if (error.response?.status === 400 && error.response?.data?.message.includes("already applied")) {
        toast.error("You have already applied for this job")
        setIsApplied(true) // Update the UI state
      } else {
        toast.error(error.response?.data?.message || "Failed to apply for job")
      }
    }
  }

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/job/findJobById/${jobId}`, { withCredentials: true })
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job))
          setIsApplied(res.data.job.applications.some((application) => application.applicant === user?._id))
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch job details")
        console.log(error)
      }
    }
    fetchSingleJob()
  }, [jobId, dispatch, user?._id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-700/50">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 rounded-xl bg-slate-700/50 border border-slate-600/50">
                  <AvatarImage src={singleJob?.company?.logo || "/placeholder.svg?height=64&width=64"} />
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{singleJob?.title}</h1>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="h-4 w-4" />
                    <span>{singleJob?.company?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={isApplied ? null : applyJobHandler}
                  disabled={isApplied}
                  className={`${
                    isApplied
                      ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isApplied ? "Already Applied" : "Apply Now"}
                </Button>
              </div>
            </div>

            {/* Job highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="text-white font-medium">{singleJob?.location || "Remote"}</p>
              </div>

              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">Job Type</span>
                </div>
                <p className="text-white font-medium">{singleJob?.jobType}</p>
              </div>

              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Salary</span>
                </div>
                <p className="text-white font-medium">{singleJob?.salary} LPA</p>
              </div>

              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm">Experience</span>
                </div>
                <p className="text-white font-medium">{singleJob?.experience} years</p>
              </div>
            </div>
          </div>

          {/* Job details */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">{singleJob?.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Positions Available</span>
                      <p className="text-white font-medium">{singleJob?.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Posted Date</span>
                      <p className="text-white font-medium">{singleJob?.createdAt?.split("T")[0]}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Application Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Total Applicants</span>
                      <p className="text-white font-medium">{singleJob?.applications?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Your Status</span>
                      <p className="text-white font-medium">{isApplied ? "Applied" : "Not Applied"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <Button
                onClick={isApplied ? null : applyJobHandler}
                disabled={isApplied}
                size="lg"
                className={`px-12 py-4 text-lg ${
                  isApplied
                    ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isApplied ? "Already Applied" : "Apply for this Position"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDescription