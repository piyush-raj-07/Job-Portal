import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import VerifyEmail from './components/auth/VerifyEmail'
import Jobs from './components/Jobs'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from './components/admin/AdminJobs'
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import ResumeBuilder from './components/resume/ResumeBuilder'
import MyResumes from './components/resume/MyResumes'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import useCheckAuth from './hooks/useCheckAuth'

const App = () => {
  // Restore the logged-in user from the refreshToken cookie
  useCheckAuth()
  const { authChecked } = useSelector((store) => store.auth)

  const appRouter = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <Signup /> },
    { path: '/verify-email', element: <VerifyEmail /> }, // ?token=... comes from the email link
    { path: '/jobs', element: <Jobs /> },
    { path: '/profile', element: <Profile /> },
    { path: '/my-resumes', element: <MyResumes /> },
    { path: '/resume-builder', element: <ResumeBuilder /> },
    { path: '/resume-builder/:id', element: <ResumeBuilder /> },
    { path: '/description/:id', element: <JobDescription /> },
    // Admin routes
    { path: '/admin/companies', element: <ProtectedRoute><Companies /></ProtectedRoute> },
    { path: '/admin/companies/create', element: <ProtectedRoute><CompanyCreate /></ProtectedRoute> },
    { path: '/admin/companies/:id', element: <ProtectedRoute><CompanySetup /></ProtectedRoute> },
    { path: '/admin/jobs', element: <ProtectedRoute><AdminJobs /></ProtectedRoute> },
    { path: '/admin/jobs/create', element: <ProtectedRoute><PostJob /></ProtectedRoute> },
    { path: '/admin/jobs/:id/applicants', element: <ProtectedRoute><Applicants /></ProtectedRoute> },
  ])

  // Wait for the session check, otherwise pages like /my-resumes would see
  // user = null for a moment and redirect to /login
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
