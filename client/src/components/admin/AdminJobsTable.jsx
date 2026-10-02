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
        <div className="p-4 rounded-full bg-blue-50 border border-blue-100 mb-4">
          <Briefcase className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No jobs found
        </h3>
        <p className="text-slate-500 text-center max-w-md mb-6">
          {searchJobByText
            ? "No jobs match your search criteria."
            : "You haven't posted any jobs yet."}
        </p>
        <Button
          onClick={() => navigate("/admin/jobs/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Your First Job
        </Button>
      </div>
    )
  }

  // 🧾 Table
  return (
    <div>
      <Table className="[&_th:first-child]:pl-6 [&_td:first-child]:pl-6 [&_th:last-child]:pr-6 [&_td:last-child]:pr-6">
        <TableCaption className="mt-0 py-4 text-xs text-slate-500 border-t border-slate-100">
          A list of your recent posted jobs ({filterJobs.length})
        </TableCaption>

        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-200">
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Company</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Role</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Date Posted</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterJobs.map((job) => (
            <TableRow
              key={job._id}
              className="border-slate-100 hover:bg-blue-50/40 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-slate-900">
                    {job?.company?.name}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div>
                  <div className="font-medium text-slate-900">
                    {job?.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {job?.jobType}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{job?.createdAt?.split("T")[0]}</span>
                </div>
              </TableCell>

              <TableCell>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </TableCell>

              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-48 bg-white border border-slate-200 p-2 rounded-xl shadow-xl shadow-slate-900/10">
                    <Button
                      onClick={() =>
                        navigate(`/admin/jobs/${job._id}/applicants`)
                      }
                      variant="ghost"
                      className="w-full justify-start text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Applicants
                    </Button>

                    <Button
                      onClick={() => handleDeleteJob(job._id)}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
