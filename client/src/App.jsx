import React from 'react'
import { Button } from "@/components/ui/button"
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup' 
import Jobs from './components/Jobs';
import Browse from './components/Browse';
import Profile from './components/Profile';
import JobDescription from './components/JobDescription';
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from './components/admin/AdminJobs';
import PostJob from './components/admin/PostJob';
import Applicants from './components/admin/Applicants';


 

const App = () => {
  const appRouter = createBrowserRouter([
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: "/jobs",
      element: <Jobs />

    },
    {
       path:"/browse",
       element: <Browse/>
    },
    {
      path:"/profile",
      element: <Profile/>
    },
    {
      path: "/description/:id",
      element: <JobDescription />
    },
    //admin:
    
    {
      path:"/admin/companies",
      element: <Companies/>
    },
    {
      path:"/admin/companies/create",
      element:<CompanyCreate/> 
    },
    {
      path:"/admin/companies/:id",
      element:<CompanySetup/>
    },
   
    {
      path:"/admin/jobs",
      element:<AdminJobs/> 
    },
    {
      path:"/admin/jobs/create",
      element:<PostJob/>
    },
    {
      path:"/admin/jobs/:id/applicants",
      element:<Applicants/>
    },
  
  ])
  return (
    <div>
       <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
