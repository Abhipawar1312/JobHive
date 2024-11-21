import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Home from "./components/Home";
import Jobs from "./components/Jobs";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import JobDescription from "./components/JobDescription";
import Companies from "./components/Admin/Companies";
import CompanyCreate from "./components/Admin/CompanyCreate";
import CompanySetup from "./components/Admin/CompanySetup";
import AdminJobs from "./components/Admin/AdminJobs";
import PostJobs from "./components/Admin/PostJobs";
import Applicants from "./components/Admin/Applicants";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/description/:id",
    element: <JobDescription />,
  },
  {
    path: "/browse",
    element: <Browse />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },

  //admin

  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <CompanyCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetup />,
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        <AdminJobs />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        <PostJobs />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create/:jobId",
    element: (
      <ProtectedRoute>
        <PostJobs />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />,
      </ProtectedRoute>
    ),
  },
]);
function App() {
  return (
    <>
      <ThemeProvider>
        <RouterProvider router={appRouter} />
      </ThemeProvider>
    </>
  );
}

export default App;
