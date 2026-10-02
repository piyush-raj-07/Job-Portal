import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSearchedQuery } from "@/redux/jobSlice"
import {
  MapPin, Briefcase, DollarSign, Clock, ChevronDown,
  ChevronUp, X, SlidersHorizontal, Star, Zap
} from "lucide-react"
import { Button } from "./ui/button"

const filterData = [
  {
    id: "location",
    label: "Location",
    icon: MapPin,
    type: "checkbox",
    options: ["Remote", "Delhi NCR", "Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai"],
  },
  {
    id: "jobType",
    label: "Job Type",
    icon: Briefcase,
    type: "checkbox",
    options: ["Full Time", "Part Time", "Contract", "Internship", "Freelance"],
  },
  {
    id: "experience",
    label: "Experience Level",
    icon: Star,
    type: "checkbox",
    options: ["Fresher (0-1 yr)", "Junior (1-3 yrs)", "Mid (3-5 yrs)", "Senior (5+ yrs)"],
  },
  {
    id: "posted",
    label: "Date Posted",
    icon: Clock,
    type: "radio",
    options: ["Last 24 hours", "Last 3 days", "Last week", "Last month", "Any time"],
  },
]

const FilterCard = ({ onFilterChange }) => {
  const dispatch = useDispatch()
  const { searchedQuery } = useSelector((store) => store.job)

  const [openSections, setOpenSections] = useState({
    location: true,
    jobType: true,
    experience: false,
    posted: false,
  })
  const [selectedFilters, setSelectedFilters] = useState({
    location: [],
    jobType: [],
    experience: [],
    posted: "",
  })
  const [salaryRange, setSalaryRange] = useState([0, 50])

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleCheckbox = (sectionId, value) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId]
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      const next = { ...prev, [sectionId]: updated }
      onFilterChange?.(next, salaryRange)
      return next
    })
  }

  const handleRadio = (sectionId, value) => {
    setSelectedFilters((prev) => {
      const next = { ...prev, [sectionId]: value }
      onFilterChange?.(next, salaryRange)
      return next
    })
  }

  const handleSalary = (e) => {
    const val = Number(e.target.value)
    setSalaryRange([0, val])
    onFilterChange?.(selectedFilters, [0, val])
  }

  const activeCount =
    Object.values(selectedFilters).flat().filter(Boolean).length +
    (salaryRange[1] < 50 ? 1 : 0)

  const clearAll = () => {
    setSelectedFilters({ location: [], jobType: [], experience: [], posted: "" })
    setSalaryRange([0, 50])
    dispatch(setSearchedQuery(""))
    onFilterChange?.({ location: [], jobType: [], experience: [], posted: "" }, [0, 50])
  }

  // Active filter chips
  const allActiveChips = [
    ...selectedFilters.location.map((v) => ({ label: v, section: "location" })),
    ...selectedFilters.jobType.map((v) => ({ label: v, section: "jobType" })),
    ...selectedFilters.experience.map((v) => ({ label: v, section: "experience" })),
    ...(selectedFilters.posted ? [{ label: selectedFilters.posted, section: "posted" }] : []),
    ...(salaryRange[1] < 50 ? [{ label: `Up to ${salaryRange[1]} LPA`, section: "salary" }] : []),
  ]

  const removeChip = (chip) => {
    if (chip.section === "salary") {
      setSalaryRange([0, 50])
      onFilterChange?.(selectedFilters, [0, 50])
    } else if (chip.section === "posted") {
      handleRadio("posted", "")
    } else {
      handleCheckbox(chip.section, chip.label)
    }
  }

  return (
    <div className="w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Active Chips */}
      {allActiveChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          {allActiveChips.map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full"
            >
              {chip.label}
              <button onClick={() => removeChip(chip)} className="text-blue-400 hover:text-red-600 transition-colors ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Salary Slider */}
      <div className="mb-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <DollarSign className="h-4 w-4 text-amber-600" />
            Salary Range
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            {salaryRange[1] === 50 ? "Any" : `≤ ${salaryRange[1]} LPA`}
          </span>
        </div>
        <div className="px-4 pb-4">
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={salaryRange[1]}
            onChange={handleSalary}
            className="w-full h-1.5 appearance-none rounded-full cursor-pointer accent-blue-600"
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(salaryRange[1] / 50) * 100}%, #e2e8f0 ${(salaryRange[1] / 50) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1.5">
            <span>0 LPA</span>
            <span>50 LPA</span>
          </div>
        </div>
      </div>

      {/* Filter Sections */}
      {filterData.map((section) => {
        const Icon = section.icon
        const isOpen = openSections[section.id]
        const selectedCount =
          section.type === "radio"
            ? selectedFilters[section.id] ? 1 : 0
            : selectedFilters[section.id]?.length || 0

        return (
          <div
            key={section.id}
            className="mb-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Icon className="h-4 w-4 text-blue-600" />
                {section.label}
                {selectedCount > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
                    {selectedCount}
                  </span>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                {section.options.map((option) => {
                  const isSelected =
                    section.type === "radio"
                      ? selectedFilters[section.id] === option
                      : selectedFilters[section.id]?.includes(option)

                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-lg transition-all ${
                        isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 group-hover:border-slate-400"
                        }`}
                        onClick={() =>
                          section.type === "radio"
                            ? handleRadio(section.id, isSelected ? "" : option)
                            : handleCheckbox(section.id, option)
                        }
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          isSelected ? "text-blue-700 font-medium" : "text-slate-600 group-hover:text-slate-900"
                        }`}
                        onClick={() =>
                          section.type === "radio"
                            ? handleRadio(section.id, isSelected ? "" : option)
                            : handleCheckbox(section.id, option)
                        }
                      >
                        {option}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Apply Button */}
      <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-medium flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 transition-all">
        <Zap className="h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  )
}

export default FilterCard