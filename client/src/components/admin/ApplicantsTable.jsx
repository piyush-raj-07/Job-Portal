"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { MoreHorizontal, FileText, Mail, Phone, Calendar, CheckCircle, XCircle, Users } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import axios from "axios"
import { Button } from "../ui/button"

const shortlistingStatus = ["Accepted", "Rejected"]

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application)

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true
      const res = await axios.post(`http://localhost:3000/api/v1/application/status/${id}/update`, { status })
      if (res.data.success) {
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/30">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/30">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/30">
            <Calendar className="h-3 w-3" />
            Pending
          </span>
        )
    }
  }

  if (!applicants?.applications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-gray-700 mb-4">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No applicants yet</h3>
        <p className="text-gray-400 text-center max-w-md">
          No one has applied for this position yet. Share your job posting to attract more candidates.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Table>
        <TableCaption className="text-gray-400 mb-4">
          Recent applicants for this position ({applicants?.applications?.length})
        </TableCaption>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/50">
            <TableHead className="text-gray-300 font-semibold">Candidate</TableHead>
            <TableHead className="text-gray-300 font-semibold">Contact</TableHead>
            <TableHead className="text-gray-300 font-semibold">Resume</TableHead>
            <TableHead className="text-gray-300 font-semibold">Applied Date</TableHead>
            <TableHead className="text-gray-300 font-semibold">Status</TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants?.applications?.map((item) => (
            <TableRow key={item._id} className="border-gray-700 hover:bg-gray-700/30 transition-colors">
              <TableCell>
                <div>
                  <div className="font-medium text-white">{item?.applicant?.fullname}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Mail className="h-3 w-3" />
                    {item?.applicant?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{item?.applicant?.phoneNumber}</span>
                </div>
              </TableCell>
              <TableCell>
                {item.applicant?.profile?.resume ? (
                  <a
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer"
                    href={item?.applicant?.profile?.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{item?.applicant?.profile?.resumeOriginalName || "View Resume"}</span>
                  </a>
                ) : (
                  <span className="text-gray-500">No resume</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{item?.applicant.createdAt.split("T")[0]}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                  <PopoverContent className="w-40 bg-gray-800 border border-gray-700 p-2">
                    {shortlistingStatus.map((status, index) => (
                      <Button
                        key={index}
                        onClick={() => statusHandler(status, item?._id)}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 mb-1"
                      >
                        {status === "Accepted" ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
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
