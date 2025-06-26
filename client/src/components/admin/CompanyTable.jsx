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
        <div className="p-4 rounded-full bg-gray-700 mb-4">
          <Building className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No companies found</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">
          {searchCompanyByText
            ? "No companies match your search criteria."
            : "You haven't registered any companies yet."}
        </p>
        <Button
          onClick={() => navigate("/admin/companies/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Company
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Table>
        <TableCaption className="text-gray-400 mb-4">
          A list of your registered companies ({filterCompany.length})
        </TableCaption>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/50">
            <TableHead className="text-gray-300 font-semibold">Company</TableHead>
            <TableHead className="text-gray-300 font-semibold">Location</TableHead>
            <TableHead className="text-gray-300 font-semibold">Created Date</TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterCompany?.map((company) => (
            <TableRow key={company._id} className="border-gray-700 hover:bg-gray-700/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg bg-gray-700 border border-gray-600">
                    <AvatarImage src={company.logo || "/placeholder.svg?height=40&width=40"} />
                  </Avatar>
                  <span className="font-medium text-white">{company.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                {company.location || <span className="text-gray-500">Not specified</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{company.createdAt.split("T")[0]}</span>
                </div>
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
                      onClick={() => navigate(`/admin/companies/${company._id}`)}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Edit2 className="h-4 w-4 mr-2 text-blue-500" />
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
