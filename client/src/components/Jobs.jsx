import { useEffect, useState, useMemo } from "react"
import Navbar from "./shared/Navbar"
import Job from "./Job"
import { useSelector } from "react-redux"
import {
  Search, X, TrendingUp, MapPin, Briefcase, Star,
  LayoutGrid, List, ChevronDown
} from "lucide-react"
import { Button } from "./ui/button"
import useGetAllJobs from "@/hooks/useGetAllJobs"

/* ── Quick-filter definition ─────────────────────────────── */
const QUICK_FILTERS = [
  {
    id: "location",
    label: "Location",
    icon: MapPin,
    options: ["Remote", "Delhi NCR", "Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai"],
  },
  {
    id: "jobType",
    label: "Job Type",
    icon: Briefcase,
    options: ["Full Time", "Part Time", "Contract", "Internship", "Freelance"],
  },
  {
    id: "experience",
    label: "Experience",
    icon: Star,
    options: ["Fresher", "Junior", "Mid-Level", "Senior"],
  },
]

/* ── Small chip used in the tag cloud ───────────────────── */
const Chip = ({ label, active, onClick, color = "blue" }) => {
  const base =
    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer select-none transition-all duration-200 border whitespace-nowrap"
  const on = `bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20`
  const off = `bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900`
  return (
    <button className={`${base} ${active ? on : off}`} onClick={onClick}>
      {label}
      {active && <X className="h-3 w-3 opacity-80" />}
    </button>
  )
}

/* ── Dropdown that shows a section's options ─────────────── */
const FilterDropdown = ({ filter, selected, onToggle, onClear }) => {
  const [open, setOpen] = useState(false)
  const Icon = filter.icon
  const count = selected.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
          ${count > 0
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {filter.label}
        {count > 0 && (
          <span className="bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-3 min-w-[180px]">
            {count > 0 && (
              <button
                onClick={() => { onClear(); setOpen(false) }}
                className="w-full text-left text-xs text-red-600 hover:text-red-700 px-2 py-1 mb-2 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear {filter.label}
              </button>
            )}
            {filter.options.map(opt => {
              const active = selected.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all
                    ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${active ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Main Jobs page ──────────────────────────────────────── */
const Jobs = () => {
  useGetAllJobs()

  const { allJobs, searchedQuery } = useSelector((store) => store.job)
  const [searchInput, setSearchInput] = useState(searchedQuery || "")
  const [selected, setSelected] = useState({ location: [], jobType: [], experience: [] })
  const [sortBy, setSortBy] = useState("newest")
  const [view, setView] = useState("grid") // "grid" | "list"

  const toggle = (section, val) =>
    setSelected(prev => ({
      ...prev,
      [section]: prev[section].includes(val)
        ? prev[section].filter(v => v !== val)
        : [...prev[section], val],
    }))

  const clearSection = (section) =>
    setSelected(prev => ({ ...prev, [section]: [] }))

  const clearAll = () => {
    setSelected({ location: [], jobType: [], experience: [] })
    setSearchInput("")
  }

  const totalActiveFilters =
    selected.location.length + selected.jobType.length + selected.experience.length

  /* All active chips merged */
  const activeChips = [
    ...selected.location.map(v => ({ label: v, section: "location" })),
    ...selected.jobType.map(v => ({ label: v, section: "jobType" })),
    ...selected.experience.map(v => ({ label: v, section: "experience" })),
  ]

  const filterJobs = useMemo(() => {
    let jobs = [...allJobs]

    const kw = searchInput.trim().toLowerCase()
    if (kw) {
      jobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(kw) ||
        j.description?.toLowerCase().includes(kw) ||
        j.location?.toLowerCase().includes(kw) ||
        j.company?.name?.toLowerCase().includes(kw)
      )
    }

    if (selected.location.length) {
      jobs = jobs.filter(j =>
        selected.location.some(l =>
          l.toLowerCase() === "remote"
            ? j.jobType?.toLowerCase() === "remote" || j.location?.toLowerCase().includes("remote")
            : j.location?.toLowerCase().includes(l.toLowerCase())
        )
      )
    }

    if (selected.jobType.length) {
      jobs = jobs.filter(j =>
        selected.jobType.some(t => j.jobType?.toLowerCase().includes(t.toLowerCase()))
      )
    }

    if (selected.experience.length) {
      jobs = jobs.filter(j =>
        selected.experience.some(e => j.experienceLevel?.toLowerCase().includes(e.toLowerCase()))
      )
    }

    if (sortBy === "newest") jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === "oldest") jobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    return jobs
  }, [allJobs, searchInput, selected, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Top hero bar ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-7">

          {/* Title */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Explore Jobs
              <span className="ml-3 text-sm font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full align-middle">
                {allJobs.length} live
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Find your next opportunity from thousands of listings
            </p>
          </div>

          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, skill, or company..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick-filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {QUICK_FILTERS.map(f => (
              <FilterDropdown
                key={f.id}
                filter={f}
                selected={selected[f.id]}
                onToggle={(val) => toggle(f.id, val)}
                onClear={() => clearSection(f.id)}
              />
            ))}

            {totalActiveFilters > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all"
              >
                <X className="h-3.5 w-3.5" />
                Clear all ({totalActiveFilters})
              </button>
            )}

            {/* Stats */}
            <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-blue-600 font-semibold">{filterJobs.length}</span> results
            </span>
          </div>

          {/* Active chip strip */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
              {activeChips.map((chip, i) => (
                <Chip
                  key={i}
                  label={chip.label}
                  active
                  onClick={() => toggle(chip.section, chip.label)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Job grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filterJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-500 text-sm text-center max-w-xs">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button
              onClick={clearAll}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl px-5 shadow-sm shadow-blue-600/20"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className={view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "flex flex-col gap-4"
          }>
            {filterJobs.map((job) => (
              <Job key={job._id} job={job} view={view} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Jobs