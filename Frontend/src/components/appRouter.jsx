// appRouter.js or wherever you configure your router
import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import ProtectedRoute from "./Admin/ProtectedRoute";

// Lazy load your components (pages)
const Home = lazy(() => import("./Home"));
const Login = lazy(() => import("./auth/Login"));
const Signup = lazy(() => import("./auth/Signup"));
const Jobs = lazy(() => import("./Jobs"));
const Browse = lazy(() => import("./Browse"));
const Profile = lazy(() => import("./Profile"));
const JobDescription = lazy(() => import("./JobDescription"));
const SavedJobs = lazy(() => import("./SavedJobs"));

// Lazy load your admin components
const Companies = lazy(() => import("./Admin/Companies"));
const CompanyCreate = lazy(() => import("./Admin/CompanyCreate"));
const CompanySetup = lazy(() => import("./Admin/CompanySetup"));
const AdminJobs = lazy(() => import("./Admin/AdminJobs"));
const PostJobs = lazy(() => import("./Admin/PostJobs"));
const Applicants = lazy(() => import("./Admin/Applicants"));

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // Layout that includes Navbar and an Outlet
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "jobs", element: <Jobs /> },
      { path: "description/:id", element: <JobDescription /> },
      { path: "browse", element: <Browse /> },
      { path: "profile", element: <Profile /> },
      { path: "SavedJobs", element: <SavedJobs /> },
      // Admin routes
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
