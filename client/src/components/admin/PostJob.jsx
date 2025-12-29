"use client"

import { useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useSelector } from "react-redux"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import axios from "axios"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { Loader2, Briefcase, ArrowLeft } from "lucide-react"

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    companyId: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { companies } = useSelector((store) => store.company)

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find((company) => company.name.toLowerCase() === value)
    setInput({ ...input, companyId: selectedCompany._id })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axios.post(`${BASE_URL}/api/v1/job/postJob`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/admin/jobs")
      }
    } catch (error) {
      toast.error(error.response.data.message || "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/admin/jobs")}
          variant="outline"
          className="mb-8 border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Main Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-full bg-blue-900/30">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Post New Job</h1>
              <p className="text-gray-400">Create a new job posting to attract top talent</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-200">Job Title</Label>
                <Input
                  type="text"
                  name="title"
                  value={input.title}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-200">Job Type</Label>
                <Input
                  type="text"
                  name="jobType"
                  value={input.jobType}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="e.g. Full-time, Part-time, Contract"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-200">Job Description</Label>
                <Input
                  type="text"
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Describe the role and responsibilities..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-200">Requirements</Label>
                <Input
                  type="text"
                  name="requirements"
                  value={input.requirements}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="List the required skills and qualifications..."
                  required
                />
              </div>

              <div>
                <Label className="text-gray-200">Salary (LPA)</Label>
                <Input
                  type="text"
                  name="salary"
                  value={input.salary}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="e.g. 10-15"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-200">Location</Label>
                <Input
                  type="text"
                  name="location"
                  value={input.location}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="e.g. New York, Remote"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-200">Experience Level</Label>
                <Input
                  type="text"
                  name="experience"
                  value={input.experience}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="e.g. 2-5 years"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-200">Number of Positions</Label>
                <Input
                  type="number"
                  name="position"
                  value={input.position}
                  onChange={changeEventHandler}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>

              {companies.length > 0 && (
                <div className="md:col-span-2">
                  <Label className="text-gray-200">Select Company</Label>
                  <Select onValueChange={selectChangeHandler}>
                    <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Choose a company" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectGroup>
                        {companies.map((company) => (
                          <SelectItem
                            key={company._id}
                            value={company?.name?.toLowerCase()}
                            className="text-white hover:bg-gray-700"
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {companies.length === 0 && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                <p className="text-red-400 text-sm text-center">
                  ⚠️ Please register a company first before posting jobs
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/jobs")}
                className="flex-1 border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || companies.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting Job...
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob
