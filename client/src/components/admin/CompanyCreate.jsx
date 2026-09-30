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
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />
      <div className="fixed top-24 right-1/5 w-72 h-72 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        <button
          onClick={() => navigate("/admin/companies")}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Companies
        </button>

        <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-purple flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Create Company</h1>
              <p className="text-slate-500 text-sm">Set up your company to start posting jobs</p>
            </div>
          </div>

          {/* Info callout */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/10 mb-7">
            <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-400 text-sm leading-relaxed">
              Give your company a name to get started. You can add a logo, description, website, and more after creation.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-medium">Company Name</Label>
              <Input
                type="text"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-xl h-11"
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
                className="flex-1 border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={registerNewCompany}
                disabled={loading}
                className="flex-1 gradient-purple hover:opacity-90 text-white rounded-xl h-11 font-semibold shadow-lg shadow-violet-900/30"
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