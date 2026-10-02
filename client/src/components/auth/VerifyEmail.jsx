import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Loader2, Mail, MailCheck, CheckCircle2, XCircle, ArrowRight } from "lucide-react"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/*
 * This page has two jobs:
 *
 * 1. /verify-email?token=abc  → opened from the email link.
 *    Sends the token to the backend, then shows success or an error.
 *
 * 2. /verify-email            → opened right after signup (or a blocked login).
 *    Shows "check your inbox" and a form to resend the email.
 */
const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  // status is one of: "checkInbox", "verifying", "success", "error"
  const [status, setStatus] = useState(token ? "verifying" : "checkInbox")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState(location.state?.email || "") // passed from Signup/Login
  const [sending, setSending] = useState(false)

  // In development, React StrictMode runs every effect twice. A token only
  // works once, so the second call would fail and replace the success
  // message with an error. This ref makes sure we call the API only once.
  const alreadyCalled = useRef(false)

  useEffect(() => {
    if (!token || alreadyCalled.current) return
    alreadyCalled.current = true

    const verify = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/api/v1/user/verify-email`, { token })
        setStatus("success")
        setMessage(res.data.message)
      } catch (error) {
        setStatus("error")
        setMessage(error.response?.data?.message || "Verification failed. Please try again.")
      }
    }
    verify()
  }, [token])

  const resendHandler = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    try {
      setSending(true)
      const res = await axios.post(`${BASE_URL}/api/v1/user/resend-verification`, { email })
      toast.success(res.data.message)
    } catch (error) {
      // 429 = rate limit reached; the backend sends a friendly message for it
      toast.error(error.response?.data?.message || "Could not send the email. Please try again.")
    } finally {
      setSending(false)
    }
  }

  // Shown when the user still needs a (new) link
  const resendForm = (
    <form onSubmit={resendHandler} className="space-y-3 mt-6 pt-6 border-t border-slate-100 text-left">
      <Label className="text-slate-700 text-sm font-medium">{"Didn't get the email?"}</Label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 rounded-xl h-11"
        />
      </div>
      <Button
        type="submit"
        disabled={sending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl font-semibold text-sm"
      >
        {sending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
        ) : (
          "Resend verification email"
        )}
      </Button>
    </form>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Soft background blobs */}
      <div className="fixed top-20 left-1/5 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/5 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-900/5 text-center">

            {status === "verifying" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-5" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying your email…</h1>
                <p className="text-slate-500 text-sm">This will only take a moment.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-5" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Email verified!</h1>
                <p className="text-slate-500 text-sm mb-6">{message}</p>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <span>Go to Login</span> <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-5" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification failed</h1>
                <p className="text-slate-500 text-sm">{message}</p>
                {resendForm}
              </>
            )}

            {status === "checkInbox" && (
              <>
                <MailCheck className="h-12 w-12 text-blue-600 mx-auto mb-5" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
                <p className="text-slate-500 text-sm">
                  We sent a verification link to{" "}
                  <span className="font-semibold text-slate-700">{email || "your email"}</span>.
                  Click the link to activate your account, then log in.
                </p>
                {resendForm}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
