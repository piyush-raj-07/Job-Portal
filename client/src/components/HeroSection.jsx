"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Search, Sparkles, ArrowRight, TrendingUp, Users, Briefcase } from "lucide-react"
import { useDispatch } from "react-redux"
import { setSearchedQuery } from "@/redux/jobSlice"
import { useNavigate } from "react-router-dom"

const HeroSection = () => {
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query))
    navigate("/jobs")
  }

  const stats = [
    { icon: Briefcase, value: "10K+", label: "Live Jobs", color: "text-violet-400" },
    { icon: Users, value: "500+", label: "Companies", color: "text-indigo-400" },
    { icon: TrendingUp, value: "1M+", label: "Placed", color: "text-purple-400" },
  ]

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden bg-[#080d1a]">
      {/* Background glow orbs */}
      <div className="absolute top-20 left-1/5 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/5 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/10 mb-8 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-sm text-violet-300 font-medium">AI-Powered Career Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Land Your{" "}
          <span className="gradient-text">Dream Job</span>{" "}
          <br className="hidden md:block" />
          Faster Than Ever
        </h1>

        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover thousands of opportunities that match your skills. Upload your resume and let our AI find the perfect match for you.
        </p>

        {/* Search box */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row gap-3 p-1.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
                className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-sm"
              />
            </div>
            <Button
              onClick={searchJobHandler}
              className="gradient-purple hover:opacity-90 text-white px-8 py-3.5 h-auto rounded-xl font-semibold text-sm shadow-lg shadow-violet-900/40 flex items-center gap-2 glow-purple transition-all"
            >
              Search Jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Trending tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {["Frontend", "Backend", "React", "Python", "Remote", "Data Science"].map(tag => (
            <button
              key={tag}
              onClick={() => { dispatch(setSearchedQuery(tag)); navigate("/jobs") }}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <div className={`text-3xl font-extrabold ${color} mb-1`}>{value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroSection
