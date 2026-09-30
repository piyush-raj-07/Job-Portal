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
    <div className="min-h-screen bg-[#080d1a]">
      <Navbar />

      {/* Glow */}
      <div className="fixed top-24 left-1/5 w-80 h-80 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/5 w-64 h-64 bg-indigo-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Profile Card ── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/30">

              {/* Banner */}
              <div className="relative h-28 bg-gradient-to-br from-violet-700 via-indigo-600 to-purple-700">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                />
                {/* Edit button */}
                <button
                  onClick={() => setOpen(true)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/25 border border-white/20 flex items-center justify-center text-white hover:bg-black/40 transition-all backdrop-blur-sm"
                  title="Edit Profile"
                >
                  <Pen className="h-4 w-4" />
                </button>

                {/* Avatar */}
                <div className="absolute -bottom-10 left-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-4 border-[#0e1529] gradient-purple flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-900/40 overflow-hidden">
                      {user?.profile?.profilePhoto
                        ? <img src={user.profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0e1529]" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="pt-14 px-6 pb-6">
                <div className="mb-5">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">{user?.fullname}</h1>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{user?.profile?.bio || "No bio added yet · click edit to update"}</p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Mail, label: user?.email, color: "text-violet-400" },
                    { icon: Contact, label: user?.phoneNumber || "No phone number", color: "text-indigo-400" },
                    { icon: MapPin, label: "India", color: "text-emerald-400" },
                    { icon: Calendar, label: `Joined ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}`, color: "text-amber-400" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <span className="text-slate-300 text-sm truncate">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills card */}
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-6 shadow-lg shadow-black/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center flex-shrink-0">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-bold text-white text-sm">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.profile?.skills?.length > 0
                  ? user.profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))
                  : <p className="text-slate-500 text-sm">No skills added yet</p>
                }
              </div>
            </div>

            {/* Resume card */}
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl p-6 shadow-lg shadow-black/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-indigo-400" />
                </div>
                <h2 className="font-bold text-white text-sm">Resume</h2>
              </div>

              {hasResume ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(user.profile.resume)}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/10 hover:bg-violet-500/10 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-violet-600/25 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                      {user?.profile?.resumeOriginalName || "View Resume"}
                    </p>
                    <p className="text-slate-500 text-xs">Click to open</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">No resume uploaded</p>
                    <p className="text-slate-600 text-xs">Edit profile to upload</p>
                  </div>
                </div>
              )}
            </div>

            {/* Edit profile CTA */}
            <button
              onClick={() => setOpen(true)}
              className="w-full gradient-purple hover:opacity-90 text-white rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all glow-purple"
            >
              <Pen className="h-4 w-4" /> Edit Profile
            </button>
          </div>

          {/* ── Applied Jobs ── */}
          <div className="lg:col-span-2">
            <div className="bg-[#0e1529] border border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/30">
              <div className="p-7 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center shadow-md shadow-violet-900/30">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">Applied Jobs</h2>
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