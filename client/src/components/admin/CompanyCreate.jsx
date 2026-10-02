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
import { Building2, ArrowLeft, Loader2, Sparkles } from "lucide-react"

const CompanyCreate = () => {
  const navigate = useNavigate()
  const [companyname, setCompanyname] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const registerNewCompany = async () => {
    if (!companyname.trim()) { toast.error("Please enter a company name"); return }
    try {
      setLoading(true)
      const res = await axios.post(
        `${BASE_URL}/api/v1/company/registercompany`,
        { companyname },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      )
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company))
        toast.success(res.data.message)
        navigate(`/admin/companies/${res.data.company._id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create company")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        <button
          onClick={() => navigate("/admin/companies")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-700 text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Companies
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Company</h1>
              <p className="text-slate-500 text-sm">Set up your company to start posting jobs</p>
            </div>
          </div>

          {/* Info callout */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-7">
            <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-slate-600 text-sm leading-relaxed">
              Give your company a name to get started. You can add a logo, description, website, and more after creation.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm font-medium">Company Name</Label>
              <Input
                type="text"
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 rounded-xl h-11"
                placeholder="e.g. Google, Microsoft, Acme Corp..."
                value={companyname}
                onChange={(e) => setCompanyname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && registerNewCompany()}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/companies")}
                className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={registerNewCompany}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-sm shadow-blue-600/20"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating…</> : "Continue →"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyCreate