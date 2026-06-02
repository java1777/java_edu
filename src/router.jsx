import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Teachers from "./pages/Teachers";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import LessonDetail from "./pages/LessonDetail";
import HomeworkCreate from "./pages/HomeworkCreate";
import ExamCreate from "./pages/ExamCreate";
import ExamReview from "./pages/ExamReview";
import HomeworkReview from "./pages/HomeworkReview";
import HomeworkResults from "./pages/HomeworkResults";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Staff from "./pages/Staff";
import Rooms from "./pages/Rooms";
import Courses from "./pages/Courses";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/dashboard/teachers", element: <Teachers /> },
      { path: "/dashboard/groups", element: <Groups /> },
      { path: "/dashboard/groups/:id", element: <GroupDetail /> },
      { path: "/dashboard/groups/:groupId/lesson/:date", element: <LessonDetail /> },
      { path: "/dashboard/groups/:groupId/homework/create", element: <HomeworkCreate /> },
      { path: "/dashboard/groups/:groupId/exam/create", element: <ExamCreate /> },
      { path: "/dashboard/groups/:groupId/exam/:examId/student/:studentId/review", element: <ExamReview /> },
      { path: "/dashboard/groups/:groupId/homework/:homeworkId/student/:studentId/review", element: <HomeworkReview /> },
      { path: "/dashboard/groups/:groupId/homework/:homeworkId/results", element: <HomeworkResults /> },
      { path: "/dashboard/students", element: <Students /> },
      { path: "/dashboard/payments", element: <Payments /> },
      { path: "/dashboard/settings", element: <Settings /> },
      { path: "/dashboard/rooms", element: <Rooms /> },
      { path: "/dashboard/staff", element: <Staff /> },
      { path: "/dashboard/courses", element: <Courses /> },
    ],
  },
]);

export default router;
