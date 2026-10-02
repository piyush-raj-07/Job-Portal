import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { useSelector } from "react-redux"
import { CheckCircle2, Clock, XCircle, Building, Calendar, Loader2 } from "lucide-react"

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job)

  const jobs = allAppliedJobs || []

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
    }
  }

  return (
    <div className="rounded-xl overflow-hidden">
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="h-16 w-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
          <p className="text-slate-600 text-center max-w-md">
            You haven't applied for any jobs yet. Start exploring opportunities and apply today!
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption className="text-slate-500">A list of your recent job applications</TableCaption>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700 font-semibold">Date</TableHead>
              <TableHead className="text-slate-700 font-semibold">Job Role</TableHead>
              <TableHead className="text-slate-700 font-semibold">Company</TableHead>
              <TableHead className="text-slate-700 font-semibold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((appliedJob) => (
              <TableRow key={appliedJob._id} className="border-slate-100 hover:bg-slate-50">
                <TableCell className="text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {appliedJob?.createdAt ? 
                      new Date(appliedJob.createdAt).toLocaleDateString() : 
                      "N/A"
                    }
                  </div>
                </TableCell>
                <TableCell className="text-slate-900 font-medium">
                  {appliedJob?.job?.title || "Job Title Not Available"}
                </TableCell>
                <TableCell className="text-slate-700">
                  {appliedJob?.job?.company?.name || "Company Not Available"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={`inline-flex items-center gap-1.5 ${getStatusColor(appliedJob?.status)}`}>
                    {getStatusIcon(appliedJob?.status)}
                    {(appliedJob?.status || "pending").toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default AppliedJobTable