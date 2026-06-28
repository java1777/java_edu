import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layout/MainLayout";
import TeacherLayout from "./layout/TeacherLayout";
import TeacherGroups from "./pages/teacher/TeacherGroups";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import StudentLayout from "./layout/StudentLayout";
import StudentHome from "./pages/student/StudentHome";
import StudentGroups from "./pages/student/StudentGroups";
import StudentGroupLessons from "./pages/student/StudentGroupLessons";
import StudentLessonDetail from "./pages/student/StudentLessonDetail";
import StudentPlaceholder from "./pages/student/Placeholder";
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
  // ── O'qituvchi paneli ──
  {
    element: (
      <ProtectedRoute allow={["TEACHER"]}>
        <TeacherLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/teacher", element: <TeacherGroups /> },
      { path: "/teacher/groups", element: <TeacherGroups /> },
      { path: "/teacher/collecting", element: <TeacherGroups collecting /> },
      { path: "/teacher/profile", element: <TeacherProfile /> },
      // Guruh ichi — admin bilan bir xil to'liq funksiya (uy vazifa, dars, imtihon)
      { path: "/teacher/groups/:id", element: <GroupDetail /> },
      {
        path: "/teacher/groups/:groupId/lesson/:date",
        element: <LessonDetail />,
      },
      {
        path: "/teacher/groups/:groupId/homework/create",
        element: <HomeworkCreate />,
      },
      {
        path: "/teacher/groups/:groupId/exam/create",
        element: <ExamCreate />,
      },
      {
        path: "/teacher/groups/:groupId/exam/:examId/student/:studentId/review",
        element: <ExamReview />,
      },
      {
        path: "/teacher/groups/:groupId/homework/:homeworkId/student/:studentId/review",
        element: <HomeworkReview />,
      },
      {
        path: "/teacher/groups/:groupId/homework/:homeworkId/results",
        element: <HomeworkResults />,
      },
    ],
  },
  // ── Talaba paneli ──
  {
    element: (
      <ProtectedRoute allow={["STUDENT"]}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/student", element: <StudentHome /> },
      { path: "/student/my-groups", element: <StudentGroups /> },
      { path: "/student/my-groups/:id", element: <StudentGroupLessons /> },
      { path: "/student/my-groups/:id/lessons/:lessonId", element: <StudentLessonDetail /> },
      { path: "/student/payments", element: <StudentPlaceholder titleKey="sp.nav_payments" /> },
      { path: "/student/indicators", element: <StudentPlaceholder titleKey="sp.nav_indicators" /> },
      { path: "/student/rating", element: <StudentPlaceholder titleKey="sp.nav_rating" /> },
      { path: "/student/shop", element: <StudentPlaceholder titleKey="sp.nav_shop" /> },
      { path: "/student/extra", element: <StudentPlaceholder titleKey="sp.nav_extra" /> },
      { path: "/student/settings", element: <StudentPlaceholder titleKey="sp.nav_settings" /> },
    ],
  },
  // ── Admin / Superadmin paneli ──
  {
    element: (
      <ProtectedRoute allow={["ADMIN", "SUPERADMIN"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/dashboard/teachers", element: <Teachers /> },
      { path: "/dashboard/groups", element: <Groups /> },
      { path: "/dashboard/groups/:id", element: <GroupDetail /> },
      {
        path: "/dashboard/groups/:groupId/lesson/:date",
        element: <LessonDetail />,
      },
      {
        path: "/dashboard/groups/:groupId/homework/create",
        element: <HomeworkCreate />,
      },
      {
        path: "/dashboard/groups/:groupId/exam/create",
        element: <ExamCreate />,
      },
      {
        path: "/dashboard/groups/:groupId/exam/:examId/student/:studentId/review",
        element: <ExamReview />,
      },
      {
        path: "/dashboard/groups/:groupId/homework/:homeworkId/student/:studentId/review",
        element: <HomeworkReview />,
      },
      {
        path: "/dashboard/groups/:groupId/homework/:homeworkId/results",
        element: <HomeworkResults />,
      },
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
