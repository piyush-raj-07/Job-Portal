"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  MoreHorizontal,
  FileText,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { setAllApplicants } from "@/redux/applicationSlice"
import { toast } from "sonner"
import axios from "axios"
import { Button } from "../ui/button"

/**
 * Wraps a PDF URL with Google Docs Viewer so it opens in the browser
 * instead of downloading — avoids Cloudinary's Content-Disposition and CORS issues.
 */
const toInlineUrl = (url) => {
  if (!url) return url
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
}

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application)
  const dispatch = useDispatch()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL
  const shortlistingStatus = ["Accepted", "Rejected"]

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true
      const res = await axios.post(`${BASE_URL}/api/v1/application/status/${id}/update`, { status })
      if (res.data.success) {
        // The message also says whether the applicant was emailed
        toast.success(res.data.message)

        // Update the badge right away instead of waiting for a page refresh
        const updatedApplications = applicants.applications.map((item) =>
          item._id === id ? { ...item, status: status.toLowerCase() } : item
        )
        dispatch(setAllApplicants({ ...applicants, applications: updatedApplications }))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status")
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Calendar className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  if (!applicants?.applications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-blue-50 border border-blue-100 mb-4">
          <Users className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No applicants yet</h3>
        <p className="text-slate-500 text-center max-w-md">
          No one has applied for this position yet. Share your job posting to attract more candidates.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table className="[&_th:first-child]:pl-6 [&_td:first-child]:pl-6 [&_th:last-child]:pr-6 [&_td:last-child]:pr-6">
        <TableCaption className="mt-0 py-4 text-xs text-slate-500 border-t border-slate-100">
          Recent applicants for this position ({applicants?.applications?.length})
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-200">
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Candidate</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Contact</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Experience</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Resume</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Applied Date</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants?.applications?.map((item) => (
            <TableRow
              key={item._id}
              className="border-slate-100 hover:bg-blue-50/40 transition-colors"
            >
              {/* Candidate */}
              <TableCell>
                <div>
                  <div className="font-medium text-slate-900">{item?.applicant?.fullname}</div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[180px]">{item?.applicant?.email}</span>
                  </div>
                </div>
              </TableCell>

              {/* Contact */}
              <TableCell>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{item?.phoneNumber || item?.applicant?.phoneNumber || "—"}</span>
                </div>
              </TableCell>

              {/* Experience */}
              <TableCell>
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    {item?.yearsOfExperience != null
                      ? `${item.yearsOfExperience} yr${item.yearsOfExperience === 1 ? "" : "s"}`
                      : "—"}
                  </span>
                </div>
              </TableCell>

              {/* Resume — fl_inline forces browser to open PDF instead of downloading */}
              <TableCell>
                <div className="flex flex-col items-start gap-2">
                  {item?.resumeUrl ? (
                    <a
                      href={toInlineUrl(item.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate max-w-[140px]">
                        {item?.resumeOriginalName || "View Resume"}
                      </span>
                    </a>
                  ) : (
                    <span className="text-slate-500 text-sm">No resume</span>
                  )}
                </div>
              </TableCell>

              {/* Applied Date */}
              <TableCell>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{item?.createdAt?.split("T")[0]}</span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>{getStatusBadge(item.status)}</TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 bg-white border border-slate-200 p-2 rounded-xl shadow-xl shadow-slate-900/10">
                    {shortlistingStatus.map((status, index) => (
                      <Button
                        key={index}
                        onClick={() => statusHandler(status, item?._id)}
                        variant="ghost"
                        className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100 mb-1"
                      >
                        {status === "Accepted" ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        )}
                        {status}
                      </Button>
                    ))}
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

export default ApplicantsTable