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
    { icon: Briefcase, value: "10K+", label: "Live Jobs" },
    { icon: Users, value: "500+", label: "Companies" },
    { icon: TrendingUp, value: "1M+", label: "Placed" },
  ]

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-hero">
      {/* Soft background blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[28rem] h-[28rem] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white/80 shadow-sm mb-8 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">AI-Powered Career Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.05] tracking-tight">
          Land Your{" "}
          <span className="gradient-text">Dream Job</span>{" "}
          <br className="hidden md:block" />
          Faster Than Ever
        </h1>

        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover thousands of opportunities that match your skills. Upload your resume and let our AI find the perfect match for you.
        </p>

        {/* Search box */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
                className="w-full pl-11 pr-4 py-3.5 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm"
              />
            </div>
            <Button
              onClick={searchJobHandler}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 h-auto rounded-xl font-semibold text-sm shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all"
            >
              Search Jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Trending tags */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-16">
          <span className="text-xs font-medium text-slate-500 mr-1">Trending:</span>
          {["Frontend", "Backend", "React", "Python", "Remote", "Data Science"].map(tag => (
            <button
              key={tag}
              onClick={() => { dispatch(setSearchedQuery(tag)); navigate("/jobs") }}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="inline-grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 px-4 sm:px-6 md:px-10 py-4">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-slate-900 leading-none">{value}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroSection
