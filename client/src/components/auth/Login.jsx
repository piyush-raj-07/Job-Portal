import { useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { setUser } from "@/redux/authSlice"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { setLoading } from "@/redux/authSlice"
import { Loader2, Mail, Lock } from "lucide-react"

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "",
  })
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { loading, user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    const loginData = {
      email: input.email,
      password: input.password,
      role: input.role,
    }

    try {
      dispatch(setLoading(true))
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, loginData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.data.success) {
        dispatch(setUser(res.data.user))
        navigate("/")
        toast.success(res.data.message)
      }
    } catch (error) {
      console.error("Error:", error)
      if (error.response) {
        switch (error.response.status) {
          case 400:
            toast.error(error.response.data.message || "Invalid input. Please check your email, password, and role.")
            break
          case 404:
            toast.error("User not found. Please check your email or sign up.")
            break
          default:
            toast.error("An error occurred during login. Please try again later.")
        }
      } else {
        toast.error("Network error. Please check your internet connection.")
      }
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Welcome <span className="text-blue-500">Back</span>
              </h1>
              <p className="text-gray-400">Sign in to continue</p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={input.email}
                  name="email"
                  onChange={changeEventHandler}
                  placeholder="Enter your email"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Password
                </Label>
                <Input
                  type="password"
                  value={input.password}
                  name="password"
                  onChange={changeEventHandler}
                  placeholder="Enter your password"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200">I am a:</Label>
                <div className="flex gap-4">
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
                      className={`flex items-center justify-center w-full py-3 rounded-xl cursor-pointer transition-all ${
                        input.role === "student"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
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
                      className={`flex items-center justify-center w-full py-3 rounded-xl cursor-pointer transition-all ${
                        input.role === "recruiter"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Admin
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center pt-4">
                <span className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-medium">
                    Join now
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

export default Login
