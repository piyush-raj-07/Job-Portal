"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Eye,
  MoreHorizontal,
  Calendar,
  Building,
  Briefcase,
  Plus,
  Trash2,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import axios from "axios"
import { removeAdminJob } from "@/redux/jobSlice"

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job)
  const [filterJobs, setFilterJobs] = useState(allAdminJobs)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // 🔍 Filter jobs
  useEffect(() => {
    const filtered = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true
      return (
        job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name
          ?.toLowerCase()
          .includes(searchJobByText.toLowerCase())
      )
    })
    setFilterJobs(filtered)
  }, [allAdminJobs, searchJobByText])

  // 🗑️ Delete job handler
  const handleDeleteJob = async (jobId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this job?"
  )
  console.log(jobId, "Job ID to delete") // Debugging log
  if (!confirmDelete) return

  try {
    await axios.delete(
  `${import.meta.env.VITE_API_BASE_URL}/api/v1/job/deleteJob/${jobId}`,
  { withCredentials: true }
)
    
    dispatch(removeAdminJob(jobId))
  } catch (error) {
    console.error("Error deleting job:", error)
    alert("Failed to delete job")
  }
}


  // 🟦 Empty state
  if (filterJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-gray-700 mb-4">
          <Briefcase className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No jobs found
        </h3>
        <p className="text-gray-400 text-center max-w-md mb-6">
          {searchJobByText
            ? "No jobs match your search criteria."
            : "You haven't posted any jobs yet."}
        </p>
        <Button
          onClick={() => navigate("/admin/jobs/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Your First Job
        </Button>
      </div>
    )
  }

  // 🧾 Table
  return (
    <div className="p-6">
      <Table>
        <TableCaption className="text-gray-400 mb-4">
          A list of your recent posted jobs ({filterJobs.length})
        </TableCaption>

        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-300">Company</TableHead>
            <TableHead className="text-gray-300">Role</TableHead>
            <TableHead className="text-gray-300">Date Posted</TableHead>
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-right text-gray-300">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterJobs.map((job) => (
            <TableRow
              key={job._id}
              className="border-gray-700 hover:bg-gray-700/30"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-700">
                    <Building className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="font-medium text-white">
                    {job?.company?.name}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div>
                  <div className="font-medium text-white">
                    {job?.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {job?.jobType}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{job?.createdAt?.split("T")[0]}</span>
                </div>
              </TableCell>

              <TableCell>
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/30 text-green-400">
                  Active
                </span>
              </TableCell>

              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-48 bg-gray-800 border border-gray-700 p-2">
                    <Button
                      onClick={() =>
                        navigate(`/admin/jobs/${job._id}/applicants`)
                      }
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Applicants
                    </Button>

                    <Button
                      onClick={() => handleDeleteJob(job._id)}
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Job
                    </Button>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AdminJobsTable
