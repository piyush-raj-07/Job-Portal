"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Edit2, MoreHorizontal, Building, Calendar, Plus } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector((store) => store.company)
  const [filterCompany, setFilterCompany] = useState(companies)
  const navigate = useNavigate()

  useEffect(() => {
    const filteredCompany = companies.filter((company) => {
      if (!searchCompanyByText) {
        return true
      }
      return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase())
    })
    setFilterCompany(filteredCompany)
  }, [companies, searchCompanyByText])

  if (filterCompany.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 rounded-full bg-blue-50 border border-blue-100 mb-4">
          <Building className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No companies found</h3>
        <p className="text-slate-500 text-center max-w-md mb-6">
          {searchCompanyByText
            ? "No companies match your search criteria."
            : "You haven't registered any companies yet."}
        </p>
        <Button
          onClick={() => navigate("/admin/companies/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Company
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Table className="[&_th:first-child]:pl-6 [&_td:first-child]:pl-6 [&_th:last-child]:pr-6 [&_td:last-child]:pr-6">
        <TableCaption className="mt-0 py-4 text-xs text-slate-500 border-t border-slate-100">
          A list of your registered companies ({filterCompany.length})
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-200">
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Company</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Location</TableHead>
            <TableHead className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Created Date</TableHead>
            <TableHead className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterCompany?.map((company) => (
            <TableRow key={company._id} className="border-slate-100 hover:bg-blue-50/40 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100">
                    <AvatarImage src={company.logo || "/placeholder.svg?height=40&width=40"} />
                  </Avatar>
                  <span className="font-medium text-slate-900">{company.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-slate-600">
                {company.location || <span className="text-slate-500">Not specified</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{company.createdAt.split("T")[0]}</span>
                </div>
              </TableCell>
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
                  <PopoverContent className="w-48 bg-white border border-slate-200 p-2 rounded-xl shadow-xl shadow-slate-900/10">
                    <Button
                      onClick={() => navigate(`/admin/companies/${company._id}`)}
                      variant="ghost"
                      className="w-full justify-start text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4 mr-2 text-blue-600" />
                      Edit Company
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

export default CompaniesTable
