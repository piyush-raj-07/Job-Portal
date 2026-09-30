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
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          </div>
          <span className="font-semibold text-white text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Active Chips */}
      {allActiveChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          {allActiveChips.map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs bg-blue-900/40 border border-blue-700/40 text-blue-300 px-2.5 py-1 rounded-full"
            >
              {chip.label}
              <button onClick={() => removeChip(chip)} className="hover:text-white ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Salary Slider */}
      <div className="mb-3 bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
            <DollarSign className="h-4 w-4 text-amber-400" />
            Salary Range
          </div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
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
            className="w-full h-1.5 appearance-none rounded-full cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(salaryRange[1] / 50) * 100}%, #374151 ${(salaryRange[1] / 50) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
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
            className="mb-3 bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                <Icon className="h-4 w-4 text-blue-400" />
                {section.label}
                {selectedCount > 0 && (
                  <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-600/30 px-1.5 py-0.5 rounded-full">
                    {selectedCount}
                  </span>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-700/50 pt-3">
                {section.options.map((option) => {
                  const isSelected =
                    section.type === "radio"
                      ? selectedFilters[section.id] === option
                      : selectedFilters[section.id]?.includes(option)

                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-lg transition-all ${
                        isSelected ? "bg-blue-600/10" : "hover:bg-gray-700/40"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-600 group-hover:border-gray-400"
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
                          isSelected ? "text-blue-300 font-medium" : "text-gray-400 group-hover:text-gray-200"
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
      <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 font-medium flex items-center justify-center gap-2 transition-all">
        <Zap className="h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  )
}

export default FilterCard