import { useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { setUser, setLoading, setAccessToken } from "@/redux/authSlice"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, Users } from "lucide-react"

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "", role: "" })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL
  const { loading } = useSelector((store) => store.auth)
  const dispatch = useDispatch()

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value })

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      dispatch(setLoading(true))
      const res = await axios.post(
        `${BASE_URL}/api/v1/user/login`,
        { email: input.email, password: input.password, role: input.role },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      )
      if (res.data.success) {
        dispatch(setAccessToken(res.data.accessToken))
        dispatch(setUser(res.data.user))
        navigate("/")
        toast.success(res.data.message)
      }
    } catch (error) {
      const status = error.response?.status
      if (status === 404) toast.error("User not found. Please check your email or sign up.")
      else toast.error(error.response?.data?.message || "Login failed. Please try again.")
    } finally {
      dispatch(setLoading(false))
    }
  }

  const roles = [
    { id: "student", label: "Job Seeker", icon: Users, desc: "Find your dream role" },
    { id: "recruiter", label: "Recruiter", icon: Briefcase, desc: "Hire top talent" },
  ]

  return (
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />

      {/* Glow orbs */}
      <div className="fixed top-20 left-1/5 w-72 h-72 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/5 w-64 h-64 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-purple shadow-lg shadow-violet-900/40 mb-5">
              <span className="text-white font-black text-xl">J</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">Sign in to your JobPortal account</p>
          </div>

          {/* Card */}
          <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <form onSubmit={submitHandler} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type="email"
                    name="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    placeholder="you@example.com"
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={input.password}
                    onChange={changeEventHandler}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">I'm signing in as</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(({ id, label, icon: Icon, desc }) => (
                    <label
                      key={id}
                      htmlFor={`login-${id}`}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none
                        ${input.role === id
                          ? "border-violet-500/60 bg-violet-600/10 text-violet-200"
                          : "border-white/5 bg-white/0 text-slate-400 hover:border-white/10 hover:bg-white/5"
                        }`}
                    >
                      <input
                        type="radio"
                        id={`login-${id}`}
                        name="role"
                        value={id}
                        checked={input.role === id}
                        onChange={changeEventHandler}
                        className="sr-only"
                        required
                      />
                      <div className={`p-2 rounded-xl transition-all ${input.role === id ? "bg-violet-600/30" : "bg-white/5"}`}>
                        <Icon className={`h-4 w-4 ${input.role === id ? "text-violet-300" : "text-slate-500"}`} />
                      </div>
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-[11px] text-center opacity-70">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-purple hover:opacity-90 text-white h-12 rounded-xl font-semibold text-sm shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 mt-2 transition-all"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  <><span>Sign In</span> <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              {/* Footer */}
              <p className="text-center text-sm text-slate-500 pt-1">
                Don't have an account?{" "}
                <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Create one free
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
