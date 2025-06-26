"use client"

import { useEffect, useState } from "react"
import Navbar from "../shared/Navbar"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import CompaniesTable from "./CompanyTable"
import { useNavigate } from "react-router-dom"
import useGetAllCompanies from "@/hooks/useGetAllCompanies"
import { useDispatch } from "react-redux"
import { setSearchCompanyByText } from "@/redux/companySlice"
import { Search, Plus, Building } from "lucide-react"

const Companies = () => {
  useGetAllCompanies()
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setSearchCompanyByText(input))
  }, [input])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-900/30">
              <Building className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Manage <span className="text-blue-500">Companies</span>
              </h1>
              <p className="text-gray-400">Create and manage your company profiles</p>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Filter by company name..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button
              onClick={() => navigate("/admin/companies/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Company
            </Button>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <CompaniesTable />
        </div>
      </div>
    </div>
  )
}

export default Companies
