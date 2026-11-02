import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RequireAuth } from "./components/RequireAuth";
import { StudentDashboard } from "./components/StudentDashboard";
import { ExamInterface } from "./components/ExamInterface";
import { ResultsAnalytics } from "./components/ResultsAnalytics";
import { AdminDashboard } from "./components/AdminDashboard";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  {
    element: <RequireAuth role="student" />,
    children: [
      { path: "/student", Component: StudentDashboard },
      { path: "/exam/:examId", Component: ExamInterface },
    ],
  },
  {
    element: <RequireAuth />,
    children: [{ path: "/results", Component: ResultsAnalytics }],
  },
  {
    element: <RequireAuth role="admin" />,
    children: [{ path: "/admin", Component: AdminDashboard }],
  },
]);