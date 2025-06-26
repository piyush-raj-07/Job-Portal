"use client"

import { useEffect } from "react"
import Navbar from "../shared/Navbar"
import ApplicantsTable from "./ApplicantsTable"
import axios from "axios"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setAllApplicants } from "@/redux/applicationSlice"
import { Users, ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

const Applicants = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { applicants } = useSelector((store) => store.application)

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/application/applicants/${params.id}`, {
          withCredentials: true,
        })
        dispatch(setAllApplicants(res.data.job))
      } catch (error) {
        console.log(error)
      }
    }
    fetchAllApplicants()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/admin/jobs")}
            variant="outline"
            className="mb-6 border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Job <span className="text-blue-500">Applicants</span>
              </h1>
              <p className="text-gray-400">
                Review and manage applications for this position ({applicants?.applications?.length || 0} applicants)
              </p>
            </div>
          </div>
        </div>

        {/* Job Info Card */}
        {applicants && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{applicants.title}</h2>
                <p className="text-gray-400">{applicants.company?.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Applicants Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <ApplicantsTable />
        </div>
      </div>
    </div>
  )
}

export default Applicants
