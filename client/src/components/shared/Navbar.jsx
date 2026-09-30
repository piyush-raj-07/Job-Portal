"use client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { User2, LogOut, Menu, X, ChevronRight, FileText } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setUser } from "@/redux/authSlice"
import { toast } from "sonner"
import { useState } from "react"

const Navbar = () => {
  const { user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const logoutHandler = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/logout`, {}, { withCredentials: true })
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

  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive(to)
          ? "text-white bg-violet-600/20 border border-violet-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
    >
      {children}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080d1a]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-all">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="text-lg font-bold text-white">
            Job<span className="gradient-text">Portal</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {user && user.role === "recruiter" ? (
            <>
              <NavLink to="/admin/companies">Companies</NavLink>
              <NavLink to="/admin/jobs">Jobs</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/jobs">Jobs</NavLink>
              <NavLink to="/my-resumes">Resume</NavLink>
            </>
          )}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 text-sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="gradient-purple hover:opacity-90 text-white text-sm px-5 shadow-lg shadow-violet-900/30 glow-purple">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-white/10 px-2.5 py-1.5 hover:border-violet-500/40 hover:bg-white/5 transition-all">
                  <Avatar className="h-7 w-7 rounded-lg border border-violet-500/30">
                    <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt={user?.fullname} />
                  </Avatar>
                  <span className="text-sm text-slate-300 max-w-[120px] truncate">{user?.fullname}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 rotate-90 flex-shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-[#0e1529] border border-white/10 text-white p-0 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden mt-2">
                <div className="p-4 border-b border-white/5 flex gap-3 items-center bg-white/0">
                  <Avatar className="h-10 w-10 rounded-xl border border-violet-500/30">
                    <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt={user?.fullname} />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{user?.fullname}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.profile?.bio || "No bio yet"}</p>
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  {user?.role === "student" && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      <User2 size={16} className="text-violet-400" />
                      View Profile
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm text-left"
                  >
                    <LogOut size={16} className="text-slate-500" />
                    Sign Out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#080d1a]">
          <div className="px-4 py-3 space-y-1">
            {user && user.role === "recruiter" ? (
              <>
                <Link to="/admin/companies" className="flex items-center px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Companies</Link>
                <Link to="/admin/jobs" className="flex items-center px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Jobs</Link>
              </>
            ) : (
              <>
                <Link to="/" className="flex items-center px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link to="/jobs" className="flex items-center px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Jobs</Link>
                <Link to="/my-resumes" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <FileText size={15} className="text-violet-400" /> My Resumes
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white text-sm">Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full gradient-purple text-white text-sm mt-1">Get Started</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8 rounded-lg border border-violet-500/30">
                      <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt={user?.fullname} />
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.fullname}</p>
                      <p className="text-xs text-slate-500">{user?.role}</p>
                    </div>
                  </div>
                  {user.role === "student" && (
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                      <User2 size={15} className="text-violet-400" /> Profile
                    </Link>
                  )}
                  <button onClick={() => { logoutHandler(); setIsMobileMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm">
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
