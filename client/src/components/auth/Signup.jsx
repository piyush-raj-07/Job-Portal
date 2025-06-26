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
import { Loader2, User, Mail, Phone, Lock, Camera } from "lucide-react"

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: "",
  })
  const [errors, setErrors] = useState({})
  const { loading, user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

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
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!input.fullname) newErrors.fullname = "Full name is required"
    if (!input.email) newErrors.email = "Email is required"
    if (!input.phoneNumber) newErrors.phoneNumber = "Phone number is required"
    if (!input.password) newErrors.password = "Password is required"
    if (!input.role) newErrors.role = "Please select a role"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formData = new FormData()
    formData.append("fullname", input.fullname)
    formData.append("email", input.email)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("password", input.password)
    formData.append("role", input.role)
    if (input.file) {
      formData.append("file", input.file)
    }

    try {
      dispatch(setLoading(true))
      const res = await axios.post(`http://localhost:3000/api/v1/user/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      if (res.data.success) {
        navigate("/login")
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
                Create Your Account
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Join our platform and start your journey</p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-200 flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-4 w-4 text-indigo-400" />
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    value={input.fullname}
                    name="fullname"
                    onChange={changeEventHandler}
                    placeholder="Enter your full name"
                    required
                    className={`bg-gray-700/30 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all duration-200 ${
                      errors.fullname ? "border-red-500" : ""
                    }`}
                    aria-invalid={errors.fullname ? "true" : "false"}
                    aria-describedby={errors.fullname ? "fullname-error" : undefined}
                  />
                  {errors.fullname && (
                    <p id="fullname-error" className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200 flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="h-4 w-4 text-indigo-400" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={input.email}
                    name="email"
                    onChange={changeEventHandler}
                    placeholder="Enter your email"
                    required
                    className={`bg-gray-700/30 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all duration-200 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-200 flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="h-4 w-4 text-indigo-400" />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    value={input.phoneNumber}
                    name="phoneNumber"
                    onChange={changeEventHandler}
                    placeholder="Enter your phone number"
                    required
                    className={`bg-gray-700/30 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all duration-200 ${
                      errors.phoneNumber ? "border-red-500" : ""
                    }`}
                    aria-invalid={errors.phoneNumber ? "true" : "false"}
                    aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                  />
                  {errors.phoneNumber && (
                    <p id="phoneNumber-error" className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200 flex items-center gap-2 text-sm sm:text-base">
                    <Lock className="h-4 w-4 text-indigo-400" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={input.password}
                    name="password"
                    onChange={changeEventHandler}
                    placeholder="Create a strong password"
                    required
                    className={`bg-gray-700/30 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all duration-200 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-200 text-sm sm:text-base">I am a:</Label>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-1">
                      <input
                        type="radio"
                        id="student"
                        name="role"
                        value="student"
                        checked={input.role === "student"}
                        onChange={changeEventHandler}
                        className="sr-only"
                        required
                      />
                      <label
                        htmlFor="student"
                        className={`flex items-center justify-center w-full py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm sm:text-base ${
                          input.role === "student"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-700/30 text-gray-200 hover:bg-gray-600/50"
                        } ${errors.role ? "border border-red-500" : ""}`}
                      >
                        Member
                      </label>
                    </div>
                     <div className="flex-1">
                      <input
                        type="radio"
                        id="recruiter"
                        name="role"
                        value="recruiter"
                        checked={input.role === "recruiter"}
                        onChange={changeEventHandler}
                        className="sr-only"
                        required
                      />
                      <label
                        htmlFor="recruiter"
                        className={`flex items-center justify-center w-full py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 text-sm sm:text-base ${
                          input.role === "recruiter"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-700/30 text-gray-200 hover:bg-gray-600/50"
                        } ${errors.role ? "border border-red-500" : ""}`}
                      >
                        Admin
                      </label>
                    </div>
                  </div>
                  {errors.role && (
                    <p id="role-error" className="text-red-500 text-xs mt-1">{errors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200 flex items-center gap-2 text-sm sm:text-base">
                    <Camera className="h-4 w-4 text-indigo-400" />
                    Profile Picture
                  </Label>
                  <div className="relative">
                    <Input
                      accept="image/*"
                      type="file"
                      onChange={changeFileHandler}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label
                      htmlFor="profile-picture"
                      className={`flex items-center justify-center w-full py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 text-sm sm:text-base ${
                        errors.file ? "border border-red-500" : ""
                      }`}
                    >
                      {input.file ? "Image Selected" : "Choose Image"}
                    </label>
                    {errors.file && (
                      <p id="file-error" className="text-red-500 text-xs mt-1">{errors.file}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center pt-4">
                <span className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup