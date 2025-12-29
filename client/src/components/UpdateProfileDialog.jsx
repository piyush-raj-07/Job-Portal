

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Loader2, User, Mail, Phone, FileText, Award } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setUser } from "@/redux/authSlice"
import { toast } from "sonner"

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useSelector((store) => store.auth)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [input, setInput] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills?.join(", ") || "",
    file: null,
  })
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0]
    setInput({ ...input, file })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("fullname", input.fullname)
    formData.append("email", input.email)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("bio", input.bio)
    formData.append("skills", input.skills)
    if (input.file) {
      formData.append("file", input.file)
    }
    try {
      setLoading(true)
      const res = await axios.post(`${BASE_URL}/v1/user/profile/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      if (res.data.success) {
        console.log("Profile updated successfully:", res.data.user)
        dispatch(setUser(res.data.user))
        toast.success(res.data.message)
        setOpen(false)
      }
    } catch (error) {
      console.error("Profile update error:", error)
      if (error.response) {
        toast.error(error.response.data.message || "An error occurred while updating your profile.")
        if (error.response.data.errors) {
          Object.values(error.response.data.errors).forEach((err) => {
            toast.error(err.message)
          })
        }
      } else if (error.request) {
        toast.error("No response received from the server. Please try again.")
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-[500px] bg-slate-800/90 backdrop-blur-md text-white border border-slate-700/50 shadow-xl"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
              Update Profile
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="mt-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4 text-blue-400" />
                Full Name
              </Label>
              <Input
                name="fullname"
                type="text"
                value={input.fullname}
                onChange={changeEventHandler}
                className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-blue-400" />
                Email Address
              </Label>
              <Input
                name="email"
                type="email"
                value={input.email}
                onChange={changeEventHandler}
                className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-blue-400" />
                Phone Number
              </Label>
              <Input
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4 text-blue-400" />
                Bio
              </Label>
              <Input
                name="bio"
                value={input.bio}
                onChange={changeEventHandler}
                className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <Award className="h-4 w-4 text-blue-400" />
                Skills (comma separated)
              </Label>
              <Input
                name="skills"
                value={input.skills}
                onChange={changeEventHandler}
                className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <FileText className="h-4 w-4 text-blue-400" />
                Resume (PDF)
              </Label>
              <Input
                name="file"
                type="file"
                accept="application/pdf"
                onChange={fileChangeHandler}
                className="bg-slate-700/50 border-slate-600/50 text-white file:bg-slate-600 file:text-white file:border-0 file:rounded file:px-3 file:py-2 hover:file:bg-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/50 text-slate-300"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateProfileDialog
