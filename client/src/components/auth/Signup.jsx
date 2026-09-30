"use client"

import { useEffect, useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { setLoading } from "@/redux/authSlice"
import { Loader2, User, Mail, Phone, Lock, Camera, Eye, EyeOff, ArrowRight, CheckCircle2, Briefcase, Users } from "lucide-react"

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "", email: "", phoneNumber: "", password: "", role: "", file: "",
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const { loading, user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0]
    if (file && file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, file: "File size must be less than 2MB" })
      return
    }
    setInput({ ...input, file })
    setErrors({ ...errors, file: "" })
    if (file) setPreviewUrl(URL.createObjectURL(file))
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!input.fullname) newErrors.fullname = "Full name is required"
    if (!input.email) newErrors.email = "Email is required"
    if (!input.phoneNumber) newErrors.phoneNumber = "Phone number is required"
    if (!input.password) newErrors.password = "Password is required"
    if (!input.role) newErrors.role = "Please select a role"

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const formData = new FormData()
    formData.append("fullname", input.fullname)
    formData.append("email", input.email)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("password", input.password)
    formData.append("role", input.role)
    if (input.file) formData.append("file", input.file)

    try {
      dispatch(setLoading(true))
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      if (res.data.success) {
        navigate("/login")
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => { if (user) navigate("/") }, [])

  const fieldClass = (hasErr) =>
    `bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl h-11 transition-all ${hasErr ? "border-red-500/60" : ""}`

  const roles = [
    { id: "student", label: "Job Seeker", icon: Users, desc: "Find your next role" },
    { id: "recruiter", label: "Recruiter", icon: Briefcase, desc: "Hire top talent" },
  ]

  return (
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />

      {/* Glow orbs */}
      <div className="fixed top-32 right-1/5 w-80 h-80 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-1/5 w-64 h-64 bg-indigo-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 relative z-10">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-purple shadow-lg shadow-violet-900/40 mb-5">
              <span className="text-white font-black text-xl">J</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-500 text-sm">Join thousands of professionals on JobPortal</p>
          </div>

          {/* Card */}
          <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <form onSubmit={submitHandler} className="space-y-5">

              {/* Full name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-violet-400" /> Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="fullname"
                      value={input.fullname}
                      onChange={changeEventHandler}
                      placeholder="John Doe"
                      required
                      className={fieldClass(errors.fullname)}
                    />
                  </div>
                  {errors.fullname && <p className="text-red-400 text-xs">{errors.fullname}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-violet-400" /> Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    placeholder="you@example.com"
                    required
                    className={fieldClass(errors.email)}
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>
              </div>

              {/* Phone + Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-violet-400" /> Phone
                  </Label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={input.phoneNumber}
                    onChange={changeEventHandler}
                    placeholder="+91 98765 43210"
                    required
                    className={fieldClass(errors.phoneNumber)}
                  />
                  {errors.phoneNumber && <p className="text-red-400 text-xs">{errors.phoneNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-violet-400" /> Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={input.password}
                      onChange={changeEventHandler}
                      placeholder="Create password"
                      required
                      className={`${fieldClass(errors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">I'm joining as</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(({ id, label, icon: Icon, desc }) => (
                    <label
                      key={id}
                      htmlFor={`signup-${id}`}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none
                        ${input.role === id
                          ? "border-violet-500/60 bg-violet-600/10 text-violet-200"
                          : "border-white/5 bg-white/0 text-slate-400 hover:border-white/10 hover:bg-white/5"
                        } ${errors.role ? "border-red-500/40" : ""}`}
                    >
                      <input
                        type="radio"
                        id={`signup-${id}`}
                        name="role"
                        value={id}
                        checked={input.role === id}
                        onChange={changeEventHandler}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-xl ${input.role === id ? "bg-violet-600/30" : "bg-white/5"}`}>
                        <Icon className={`h-4 w-4 ${input.role === id ? "text-violet-300" : "text-slate-500"}`} />
                      </div>
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-[11px] text-center opacity-70">{desc}</span>
                    </label>
                  ))}
                </div>
                {errors.role && <p className="text-red-400 text-xs">{errors.role}</p>}
              </div>

              {/* Profile picture upload */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-violet-400" /> Profile Picture
                  <span className="text-slate-600 font-normal">(optional)</span>
                </Label>
                <label
                  htmlFor="profile-picture"
                  className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all
                    ${input.file ? "border-violet-500/40 bg-violet-600/10" : "border-white/5 bg-white/0 hover:border-white/10 hover:bg-white/5"}
                    ${errors.file ? "border-red-500/40" : ""}`}
                >
                  <Input
                    accept="image/*"
                    type="file"
                    onChange={changeFileHandler}
                    className="hidden"
                    id="profile-picture"
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-violet-500/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Camera className="h-5 w-5 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300 truncate">
                      {input.file ? input.file.name : "Click to upload an image"}
                    </p>
                    <p className="text-xs text-slate-600">JPG, PNG, GIF up to 2MB</p>
                  </div>
                  {input.file && <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0" />}
                </label>
                {errors.file && <p className="text-red-400 text-xs">{errors.file}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-purple hover:opacity-90 text-white h-12 rounded-xl font-semibold text-sm shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 mt-1 transition-all"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup