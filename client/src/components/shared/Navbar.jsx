"use client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { User2, LogOut, Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setUser } from "@/redux/authSlice"
import { toast } from "sonner"
import { useState } from "react"

const Navbar = () => {
  const { user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const logoutHandler = async () => {
    try {
      const res = await axios.post(`http://localhost:3000/api/v1/user/logout`, { withCredentials: true })
      if (res.data.success) {
        dispatch(setUser(null))
        navigate("/")
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-6">
        <div>
          <Link to="/" className="text-2xl font-bold">
            <span className="text-blue-500">Job</span>
            <span className="text-white">Portal</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex font-medium items-center gap-6">
            {user && user.role === "recruiter" ? (
              <>
                <li>
                  <Link
                    to="/admin/companies"
                    className="text-gray-200 hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/jobs"
                    className="text-gray-200 hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Jobs
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/"
                    className="text-gray-200 hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="text-gray-200 hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/browse"
                    className="text-gray-200 hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Browse
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Signup</Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-blue-500 hover:border-blue-400 transition-colors">
                  <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt={user?.fullname} />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border border-gray-700 text-white p-4">
                <div>
                  <div className="flex gap-3 items-start">
                    <Avatar className="border-2 border-blue-500">
                      <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt={user?.fullname} />
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-white">{user?.fullname}</h4>
                      <p className="text-sm text-gray-400">{user?.profile?.bio || "No bio available"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col my-3 border-t border-gray-700 pt-3 space-y-2">
                    {user && user.role === "student" && (
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 text-gray-200 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-gray-700"
                      >
                        <User2 className="text-blue-500" size={18} />
                        View Profile
                      </Link>
                    )}

                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 text-gray-200 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-gray-700 w-full text-left"
                    >
                      <LogOut className="text-blue-500" size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-gray-200 hover:text-white hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-6 py-4 space-y-3">
            {user && user.role === "recruiter" ? (
              <>
                <Link
                  to="/admin/companies"
                  className="block text-gray-200 hover:text-blue-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Companies
                </Link>
                <Link
                  to="/admin/jobs"
                  className="block text-gray-200 hover:text-blue-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Jobs
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block text-gray-200 hover:text-blue-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/jobs"
                  className="block text-gray-200 hover:text-blue-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  to="/browse"
                  className="block text-gray-200 hover:text-blue-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse
                </Link>
              </>
            )}

            {!user ? (
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-700">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Signup</Button>
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-700 space-y-2">
                {user.role === "student" && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-200 hover:text-blue-500 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User2 className="text-blue-500" size={18} />
                    View Profile
                  </Link>
                )}
                <button
                  onClick={() => {
                    logoutHandler()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 text-gray-200 hover:text-blue-500 transition-colors py-2 w-full text-left"
                >
                  <LogOut className="text-blue-500" size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
