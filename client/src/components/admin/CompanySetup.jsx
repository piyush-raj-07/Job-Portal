import { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2, Building2, Globe, MapPin, FileText, Camera, CheckCircle2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
  const params = useParams()
  useGetCompanyById(params.id)
  const [input, setInput] = useState({ name: "", description: "", website: "", location: "", file: null })
  const [previewUrl, setPreviewUrl] = useState(null)
  const { singleCompany } = useSelector(store => store.company)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value })

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0]
    setInput({ ...input, file })
    if (file) setPreviewUrl(URL.createObjectURL(file))
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", input.name)
    formData.append("description", input.description)
    formData.append("website", input.website)
    formData.append("location", input.location)
    if (input.file) formData.append("file", input.file)

    try {
      setLoading(true)
      const res = await axios.post(`${BASE_URL}/api/v1/company/update/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/admin/companies")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setInput({
      name: singleCompany?.name || "",
      description: singleCompany?.description || "",
      website: singleCompany?.website || "",
      location: singleCompany?.location || "",
      file: null
    })
    if (singleCompany?.logo) setPreviewUrl(singleCompany.logo)
  }, [singleCompany])

  const fieldCls = "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500 rounded-xl h-11"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 relative z-10">

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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {previewUrl
                ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                : <Building2 className="h-6 w-6 text-blue-600" />
              }
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {singleCompany?.name || "Company Setup"}
              </h1>
              <p className="text-slate-500 text-sm">Update your company profile</p>
            </div>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">

            {/* Logo upload */}
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-blue-600" /> Company Logo
              </Label>
              <label
                htmlFor="company-logo"
                className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all
                  ${input.file ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"}`}
              >
                <Input accept="image/*" type="file" onChange={changeFileHandler} className="hidden" id="company-logo" />
                {previewUrl
                  ? <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-blue-200" />
                  : <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Camera className="h-5 w-5 text-slate-500" />
                  </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {input.file ? input.file.name : "Click to upload logo"}
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
                </div>
                {input.file && <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />}
              </label>
            </div>

            {/* Name + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" /> Company Name
                </Label>
                <Input type="text" name="name" value={input.name} onChange={changeEventHandler} className={fieldCls} placeholder="Company name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" /> Location
                </Label>
                <Input type="text" name="location" value={input.location} onChange={changeEventHandler} className={fieldCls} placeholder="e.g. Bangalore, India" />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-600" /> Website
              </Label>
              <Input type="text" name="website" value={input.website} onChange={changeEventHandler} className={fieldCls} placeholder="https://yourcompany.com" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-600" /> Description
              </Label>
              <Input type="text" name="description" value={input.description} onChange={changeEventHandler} className={fieldCls} placeholder="What does your company do?" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/companies")}
                className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-sm shadow-blue-600/20"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CompanySetup