import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import ProtectedRoute from "./Admin/ProtectedRoute";

// Route-level code-splitting (Lazy loading)
const Home = lazy(() => import("./Home"));
const Login = lazy(() => import("./auth/Login"));
const Signup = lazy(() => import("./auth/Signup"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const Jobs = lazy(() => import("./Jobs"));
const Browse = lazy(() => import("./Browse"));
const Profile = lazy(() => import("./Profile"));
const JobDescription = lazy(() => import("./JobDescription"));
const SavedJobs = lazy(() => import("./SavedJobs"));

// Admin / Recruiter routes code-splitting
const RecruiterDashboard = lazy(() => import("./Admin/RecruiterDashboard"));
const Companies = lazy(() => import("./Admin/Companies"));
const CompanyCreate = lazy(() => import("./Admin/CompanyCreate"));
const CompanySetup = lazy(() => import("./Admin/CompanySetup"));
const AdminJobs = lazy(() => import("./Admin/AdminJobs"));
const PostJobs = lazy(() => import("./Admin/PostJobs"));
const Applicants = lazy(() => import("./Admin/Applicants"));

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "jobs", element: <Jobs /> },
      { path: "description/:id", element: <JobDescription /> },
      { path: "browse", element: <Browse /> },
      { path: "profile", element: <Profile /> },
      { path: "SavedJobs", element: <SavedJobs /> },

      // Admin / Recruiter routes
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/companies",
        element: (
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/companies/create",
        element: (
          <ProtectedRoute>
            <CompanyCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/companies/:id",
        element: (
          <ProtectedRoute>
            <CompanySetup />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/jobs",
        element: (
          <ProtectedRoute>
            <AdminJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/jobs/create",
        element: (
          <ProtectedRoute>
            <PostJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/jobs/create/:jobId",
        element: (
          <ProtectedRoute>
            <PostJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/jobs/:id/applicants",
        element: (
          <ProtectedRoute>
            <Applicants />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default appRouter;
