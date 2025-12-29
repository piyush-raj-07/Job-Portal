"use client"

import { useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setSingleCompany } from "@/redux/companySlice"
import { Building, ArrowLeft } from "lucide-react"

const CompanyCreate = () => {
  const navigate = useNavigate()
  const [companyname, setCompanyname] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const registerNewCompany = async () => {
    if (!companyname.trim()) {
      toast.error("Please enter a company name")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(
        `${BASE_URL}/api/v1/company/registercompany`,
        { companyname },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company))
        toast.success(res.data.message)
        const companyId = res?.data?.company?._id
        navigate(`/admin/companies/${companyId}`)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to create company")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/admin/companies")}
          variant="outline"
          className="mb-8 border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>

        {/* Main Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-full bg-blue-900/30">
              <Building className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Company</h1>
              <p className="text-gray-400">Set up your company profile to start posting jobs</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <Label className="text-gray-200 text-sm font-medium">Company Name</Label>
              <p className="text-gray-400 text-sm mb-3">
                What would you like to name your company? You can change this later.
              </p>
              <Input
                type="text"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="e.g. JobHunt, Microsoft, Google..."
                value={companyname}
                onChange={(e) => setCompanyname(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/companies")}
                className="flex-1 border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={registerNewCompany}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Creating..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyCreate
    