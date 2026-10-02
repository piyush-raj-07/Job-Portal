"use client"

import { useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useSelector } from "react-redux"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import axios from "axios"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { Loader2, Briefcase, ArrowLeft, MapPin, DollarSign, Users, Building2, FileText, Star, AlertTriangle } from "lucide-react"

const PostJob = () => {
  const [input, setInput] = useState({
    title: "", description: "", requirements: "", salary: "",
    location: "", jobType: "", experience: "", position: 0, companyId: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL
  const { companies } = useSelector((store) => store.company)

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value })

  const selectChangeHandler = (value) => {
    const co = companies.find((c) => c.name.toLowerCase() === value)
    setInput({ ...input, companyId: co._id })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axios.post(`${BASE_URL}/api/v1/job/postJob`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      if (res.data.success) { toast.success(res.data.message); navigate("/admin/jobs") }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job")
    } finally {
      setLoading(false)
    }
  }

  const fieldCls = "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 rounded-xl h-11"
  const selectTrigCls = "bg-white border-slate-200 text-slate-900 data-[placeholder]:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-0 rounded-xl h-11"
  const selectContentCls = "bg-white border-slate-200 text-slate-900 rounded-xl shadow-xl shadow-slate-900/10"

  const sections = [
    { key: "title", label: "Job Title", icon: Briefcase, placeholder: "e.g. Senior Frontend Developer", col: 1 },
    { key: "jobType", label: "Job Type", icon: FileText, placeholder: "e.g. Full-time, Remote, Contract", col: 1 },
    { key: "location", label: "Location", icon: MapPin, placeholder: "e.g. Bangalore, Remote", col: 1 },
    { key: "salary", label: "Salary (LPA)", icon: DollarSign, placeholder: "e.g. 10-15 LPA or 12 LPA", col: 1 },
    { key: "position", label: "Positions", icon: Users, placeholder: "1", col: 1, type: "number", min: "1" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        <button
          onClick={() => navigate("/admin/jobs")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-700 text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Post a New Job</h1>
              <p className="text-slate-500 text-sm">Fill in the details to attract the right candidates</p>
            </div>
          </div>

          {/* No company warning */}
          {companies.length === 0 && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-7">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-700 text-sm">
                You need to{" "}
                <button onClick={() => navigate("/admin/companies/create")} className="text-amber-800 hover:text-amber-900 underline font-semibold">
                  create a company
                </button>{" "}
                before posting a job.
              </p>
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-5">

            {/* Grid fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sections.map(({ key, label, icon: Icon, placeholder, type = "text", min }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-blue-600" /> {label}
                  </Label>
                  <Input
                    type={type}
                    name={key}
                    value={input[key]}
                    onChange={changeEventHandler}
                    className={fieldCls}
                    placeholder={placeholder}
                    min={min}
                    required
                  />
                </div>
              ))}

              {/* Experience Level */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-blue-600" /> Experience Level
                </Label>
                <Select onValueChange={(v) => setInput({ ...input, experience: v })} value={input.experience}>
                  <SelectTrigger className={selectTrigCls}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    <SelectGroup>
                      {["Fresher", "Junior", "Mid-Level", "Senior"].map((level) => (
                        <SelectItem key={level} value={level} className="text-slate-700 hover:bg-slate-100 focus:bg-blue-50 focus:text-blue-700">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-600" /> Job Description
              </Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                className={fieldCls}
                placeholder="Describe the role and responsibilities..."
                required
              />
            </div>

            {/* Requirements */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-blue-600" /> Requirements
              </Label>
              <Input
                type="text"
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                className={fieldCls}
                placeholder="Required skills, qualifications, experience..."
                required
              />
            </div>

            {/* Company selector */}
            {companies.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" /> Select Company
                </Label>
                <Select onValueChange={selectChangeHandler}>
                  <SelectTrigger className={selectTrigCls}>
                    <SelectValue placeholder="Choose a company" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem
                          key={company._id}
                          value={company.name.toLowerCase()}
                          className="text-slate-700 hover:bg-slate-100 focus:bg-blue-50 focus:text-blue-700"
                        >
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/jobs")}
                className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || companies.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-sm shadow-blue-600/20"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Posting…</> : "Post Job"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob
