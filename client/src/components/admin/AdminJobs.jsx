"use client"

import { useEffect, useState } from "react"
import Navbar from "../shared/Navbar"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import AdminJobsTable from "./AdminJobsTable"
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs"
import { setSearchJobByText } from "@/redux/jobSlice"
import { Search, Plus, Briefcase } from "lucide-react"

const AdminJobs = () => {
  useGetAllAdminJobs()
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => { dispatch(setSearchJobByText(input)) }, [input])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Postings</h1>
              <p className="text-slate-500 text-sm">Create and manage your job listings</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/admin/jobs/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-11 rounded-xl font-semibold text-sm shadow-sm shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 rounded-xl h-11"
              placeholder="Search jobs by title, role, company..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <AdminJobsTable />
        </div>
      </div>
    </div>
  )
}

export default AdminJobs
