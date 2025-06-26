"use client"

import { useEffect, useState } from "react"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { useDispatch } from "react-redux"
import { setSearchedQuery } from "@/redux/jobSlice"
import { MapPin, Briefcase, DollarSign, SlidersHorizontal, X } from "lucide-react"
import { Button } from "./ui/button"

const filterData = [
  {
    filterType: "Location",
    icon: <MapPin className="h-4 w-4 text-blue-400" />,
    array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"],
  },
  {
    filterType: "Industry",
    icon: <Briefcase className="h-4 w-4 text-blue-400" />,
    array: ["Frontend Developer", "Backend Developer", "FullStack Developer"],
  },
  {
    filterType: "Salary",
    icon: <DollarSign className="h-4 w-4 text-blue-400" />,
    array: ["0-40k", "42-1lakh", "1lakh to 5lakh"],
  },
]

const FilterCard = () => {
  const [selectedValue, setSelectedValue] = useState("")
  const dispatch = useDispatch()

  const changeHandler = (value) => {
    setSelectedValue(value)
  }

  const clearFilters = () => {
    setSelectedValue("")
    dispatch(setSearchedQuery(""))
  }

  useEffect(() => {
    dispatch(setSearchedQuery(selectedValue))
  }, [selectedValue, dispatch])

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-blue-400" />
          <h2 className="font-bold text-lg text-white">Filters</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          onClick={clearFilters}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-5 space-y-6">
        <RadioGroup value={selectedValue} onValueChange={changeHandler} className="space-y-6">
          {filterData.map((data, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2">
                {data.icon}
                <h3 className="font-semibold text-white">{data.filterType}</h3>
              </div>

              <div className="space-y-2 pl-6">
                {data.array.map((item, idx) => {
                  const itemId = `id${index}-${idx}`
                  return (
                    <div key={itemId} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={item}
                        id={itemId}
                        className="border-slate-600 text-blue-500 focus:ring-blue-500/20"
                      />
                      <Label
                        htmlFor={itemId}
                        className="text-slate-300 cursor-pointer hover:text-white transition-colors"
                      >
                        {item}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

export default FilterCard
