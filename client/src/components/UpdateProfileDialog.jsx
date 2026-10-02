

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
      const res = await axios.post(`${BASE_URL}/api/v1/user/profile/update`, formData, {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[500px] bg-white text-slate-900 border border-slate-200 shadow-xl shadow-slate-900/10"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-slate-900 tracking-tight">
            Update Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="mt-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <User className="h-4 w-4 text-blue-600" />
                Full Name
              </Label>
              <Input
                name="fullname"
                type="text"
                value={input.fullname}
                onChange={changeEventHandler}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-blue-600" />
                Email Address
              </Label>
              <Input
                name="email"
                type="email"
                value={input.email}
                onChange={changeEventHandler}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-blue-600" />
                Phone Number
              </Label>
              <Input
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <User className="h-4 w-4 text-blue-600" />
                Bio
              </Label>
              <Input
                name="bio"
                value={input.bio}
                onChange={changeEventHandler}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <Award className="h-4 w-4 text-blue-600" />
                Skills (comma separated)
              </Label>
              <Input
                name="skills"
                value={input.skills}
                onChange={changeEventHandler}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <FileText className="h-4 w-4 text-blue-600" />
                Resume (PDF)
              </Label>
              <Input
                name="file"
                type="file"
                accept="application/pdf"
                onChange={fileChangeHandler}
                className="h-11 py-1.5 items-center cursor-pointer bg-white border-slate-200 text-slate-600 file:mr-3 file:h-8 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:cursor-pointer hover:file:bg-blue-100 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-600/20" disabled={loading}>
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
