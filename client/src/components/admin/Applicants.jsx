"use client"

import { useEffect } from "react"
import Navbar from "../shared/Navbar"
import ApplicantsTable from "./ApplicantsTable"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setAllApplicants } from "@/redux/applicationSlice"
import { Users, ArrowLeft, Briefcase, Building } from "lucide-react"

const Applicants = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { applicants } = useSelector((store) => store.application)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/application/applicants/${params.id}`, {
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
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />
      <div className="fixed top-20 right-1/5 w-72 h-72 bg-indigo-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">

        {/* Back */}
        <button
          onClick={() => navigate("/admin/jobs")}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl gradient-purple flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Applicants</h1>
            <p className="text-slate-500 text-sm">
              {applicants?.applications?.length || 0} people have applied
            </p>
          </div>
        </div>

        {/* Job info card */}
        {applicants && (
          <div className="bg-[#0e1529] border border-white/5 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl gradient-purple flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-900/30">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">{applicants.title}</h2>
              <p className="text-slate-500 text-sm flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                {applicants.company?.name}
              </p>
            </div>
            <span className="ml-auto text-xs font-bold px-3 py-1.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
              {applicants?.applications?.length || 0} Applicants
            </span>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#0e1529] border border-white/5 rounded-2xl overflow-hidden">
          <ApplicantsTable />
        </div>
      </div>
    </div>
  )
}

export default Applicants
