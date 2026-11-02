import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { ExamInterface } from "./components/ExamInterface";
import { ResultsAnalytics } from "./components/ResultsAnalytics";
import { AdminDashboard } from "./components/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/student",
    Component: StudentDashboard,
  },
  {
    path: "/exam/:examId",
    Component: ExamInterface,
  },
  {
    path: "/results",
    Component: ResultsAnalytics,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
]);
