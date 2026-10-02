"use client"

import { useState } from "react"
import Navbar from "./shared/Navbar"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  Contact, Mail, Pen, MapPin, Calendar, FileText,
  Award, ExternalLink, Briefcase, CheckCircle2, User
} from "lucide-react"
import AppliedJobTable from "./AppliedJobTable"
import UpdateProfileDialog from "./UpdateProfileDialog"
import { useSelector } from "react-redux"
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs"

const Profile = () => {
  useGetAppliedJobs()
  const [open, setOpen] = useState(false)
  const { user } = useSelector((store) => store.auth)
  const hasResume = user?.profile?.resume

  const initials = (user?.fullname || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Profile Card ── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

              {/* Banner */}
              <div className="relative h-28 gradient-primary">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                />
                {/* Edit button */}
                <button
                  onClick={() => setOpen(true)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-50 transition-all shadow-sm shadow-blue-900/10"
                  title="Edit Profile"
                >
                  <Pen className="h-4 w-4" />
                </button>

                {/* Avatar */}
                <div className="absolute -bottom-10 left-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl shadow-md shadow-slate-900/10 overflow-hidden">
                      {user?.profile?.profilePhoto
                        ? <img src={user.profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="pt-14 px-6 pb-6">
                <div className="mb-5">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user?.fullname}</h1>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">{user?.profile?.bio || "No bio added yet · click edit to update"}</p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Mail, label: user?.email, color: "text-blue-600" },
                    { icon: Contact, label: user?.phoneNumber || "No phone number", color: "text-sky-600" },
                    { icon: MapPin, label: "India", color: "text-emerald-600" },
                    { icon: Calendar, label: `Joined ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}`, color: "text-amber-600" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <span className="text-slate-700 text-sm truncate">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.profile?.skills?.length > 0
                  ? user.profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))
                  : <p className="text-slate-500 text-sm">No skills added yet</p>
                }
              </div>
            </div>

            {/* Resume card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-sky-600" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Resume</h2>
              </div>

              {hasResume ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(user.profile.resume)}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-medium truncate group-hover:text-blue-700 transition-colors">
                      {user?.profile?.resumeOriginalName || "View Resume"}
                    </p>
                    <p className="text-slate-500 text-xs">Click to open</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">No resume uploaded</p>
                    <p className="text-slate-400 text-xs">Edit profile to upload</p>
                  </div>
                </div>
              )}
            </div>

            {/* Edit profile CTA */}
            <button
              onClick={() => setOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 transition-all"
            >
              <Pen className="h-4 w-4" /> Edit Profile
            </button>
          </div>

          {/* ── Applied Jobs ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-7 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900">Applied Jobs</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Track your applications and their status</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AppliedJobTable />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  )
}

export default Profile