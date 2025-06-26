"use client"

import { useState } from "react"
import Navbar from "./shared/Navbar"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Contact, Mail, Pen, MapPin, Calendar, FileText, Award } from "lucide-react"
import { Badge } from "./ui/badge"
import AppliedJobTable from "./AppliedJobTable"
import UpdateProfileDialog from "./UpdateProfileDialog"
import { useSelector } from "react-redux"
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs"

const Profile = () => {
  useGetAppliedJobs()
  const [open, setOpen] = useState(false)
  const { user } = useSelector((store) => store.auth)

  // Check if resume exists
  const hasResume = user?.profile?.resume

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="absolute -bottom-12 left-6">
                  <Avatar className="h-24 w-24 border-4 border-slate-800 bg-slate-700">
                    <AvatarImage
                      src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
                      alt="profile"
                    />
                  </Avatar>
                </div>
                <Button
                  onClick={() => setOpen(true)}
                  className="absolute top-4 right-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50"
                  variant="outline"
                  size="icon"
                >
                  <Pen className="h-4 w-4 text-blue-400" />
                </Button>
              </div>

              <div className="pt-16 px-6 pb-6">
                <h1 className="font-bold text-2xl text-white">{user?.fullname}</h1>
                <p className="text-slate-400 mt-1">{user?.profile?.bio || "No bio provided"}</p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">{user?.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Contact className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">{user?.phoneNumber || "No phone number"}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">India</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-blue-400" />
                    <h2 className="font-semibold text-lg text-white">Skills</h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user?.profile?.skills?.length !== 0 ? (
                      user?.profile?.skills?.map((item, index) => (
                        <Badge
                          key={index}
                          className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50"
                        >
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-400">No skills added yet</span>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h2 className="font-semibold text-lg text-white">Resume</h2>
                  </div>

                  {hasResume ? (
                    <div className="flex items-center gap-2">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(user.profile.resume)}`}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        <span>{user?.profile?.resumeOriginalName || "View Resume"}</span>
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-400">No resume uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Applied jobs section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="font-bold text-xl text-white">Applied Jobs</h2>
                <p className="text-slate-400 text-sm mt-1">Track your job applications and their status</p>
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