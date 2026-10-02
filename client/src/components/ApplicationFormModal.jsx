import { useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Button } from "./ui/button"
import { X, Upload, FileText } from "lucide-react"

const ApplicationFormModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const { user } = useSelector((store) => store.auth)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber?.toString() || "",
    yearsOfExperience: "",
    resumeFile: null,
    useExistingResume: !!user?.profile?.resume,
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, resumeFile: file, useExistingResume: false }))
    }
  }

  // Programmatically open the file picker
  const handleUploadClick = () => {
    setFormData((prev) => ({ ...prev, useExistingResume: false }))
    fileInputRef.current?.click()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.useExistingResume && !formData.resumeFile) {
      alert("Please upload a resume or use your existing one.")
      return
    }
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl shadow-slate-900/10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Submit Application</h2>
            <p className="text-slate-500 text-sm mt-0.5">Fill in your details below</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Phone Number */}
          <div>
            <label className="text-slate-700 text-sm font-medium mb-1.5 block">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900
                         placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2
                         focus:ring-blue-500/20 transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="text-slate-700 text-sm font-medium mb-1.5 block">
              Years of Experience <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900
                         placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2
                         focus:ring-blue-500/20 transition-colors"
              placeholder="e.g. 2"
            />
          </div>

          {/* Resume */}
          <div>
            <label className="text-slate-700 text-sm font-medium mb-2 block">
              Resume <span className="text-red-600">*</span>
            </label>

            {/* Hidden file input — triggered via ref, lives outside any other clickable element */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="space-y-3">
              {/* Use existing resume */}
              {user?.profile?.resume && (
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, useExistingResume: true }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    formData.useExistingResume
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={formData.useExistingResume}
                    onChange={() => setFormData((prev) => ({ ...prev, useExistingResume: true }))}
                    className="accent-blue-600"
                  />
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-700 text-sm font-medium">Use existing resume</p>
                    <p className="text-blue-600 text-xs truncate">
                      {user.profile.resumeOriginalName || "Uploaded Resume"}
                    </p>
                  </div>
                </div>
              )}

              {/* Upload new resume — clicking the card opens the file picker via ref */}
              <div
                onClick={handleUploadClick}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  !formData.useExistingResume
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="resumeChoice"
                  checked={!formData.useExistingResume}
                  readOnly
                  className="accent-blue-600 pointer-events-none"
                />
                <Upload className="h-4 w-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-700 text-sm font-medium">
                    {formData.resumeFile ? "Resume selected" : "Upload new resume"}
                  </p>
                  <p className="text-slate-500 text-xs truncate">
                    {formData.resumeFile
                      ? formData.resumeFile.name
                      : "Click to browse — PDF only, max 5MB"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="flex-1 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplicationFormModal