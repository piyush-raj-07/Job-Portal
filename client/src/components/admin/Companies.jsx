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
import { Search, Plus, Building2 } from "lucide-react"

const Companies = () => {
  useGetAllCompanies()
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => { dispatch(setSearchCompanyByText(input)) }, [input])

  return (
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />
      <div className="fixed top-20 right-1/5 w-72 h-72 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-purple flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Companies</h1>
              <p className="text-slate-500 text-sm">Manage your registered companies</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/admin/companies/create")}
            className="gradient-purple hover:opacity-90 text-white px-5 h-11 rounded-xl font-semibold text-sm shadow-lg shadow-violet-900/30 flex items-center gap-2 glow-purple"
          >
            <Plus className="h-4 w-4" /> New Company
          </Button>
        </div>

        {/* Search */}
        <div className="bg-[#0e1529] border border-white/5 rounded-2xl p-5 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <Input
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-xl h-11"
              placeholder="Search companies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0e1529] border border-white/5 rounded-2xl overflow-hidden">
          <CompaniesTable />
        </div>
      </div>
    </div>
  )
}

export default Companies
