"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Eye, MoreHorizontal, Calendar, Building, Briefcase, Plus } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job)
  const [filterJobs, setFilterJobs] = useState(allAdminJobs)
  const navigate = useNavigate()

  useEffect(() => {
    const filteredJobs = allAdminJobs.filter((job) => {
      if (!searchJobByText) {
        return true
      }
      return (
        job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase())
      )
    })
    setFilterJobs(filteredJobs)
  }, [allAdminJobs, searchJobByText])

  if (filterJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-gray-700 mb-4">
          <Briefcase className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">
          {searchJobByText ? "No jobs match your search criteria." : "You haven't posted any jobs yet."}
        </p>
        <Button onClick={() => navigate("/admin/jobs/create")} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Post Your First Job
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Table>
        <TableCaption className="text-gray-400 mb-4">
          A list of your recent posted jobs ({filterJobs.length})
        </TableCaption>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/50">
            <TableHead className="text-gray-300 font-semibold">Company</TableHead>
            <TableHead className="text-gray-300 font-semibold">Role</TableHead>
            <TableHead className="text-gray-300 font-semibold">Date Posted</TableHead>
            <TableHead className="text-gray-300 font-semibold">Status</TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterJobs?.map((job) => (
            <TableRow key={job._id} className="border-gray-700 hover:bg-gray-700/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-700">
                    <Building className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="font-medium text-white">{job?.company?.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-white">{job?.title}</div>
                  <div className="text-sm text-gray-400">{job?.jobType}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{job?.createdAt.split("T")[0]}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/30">
                  Active
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-gray-800 border border-gray-700 p-2">
                    <Button
                      onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Applicants
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
