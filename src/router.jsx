import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Teachers from "./pages/Teachers";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
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
      { path: "/dashboard/students", element: <Students /> },
      { path: "/dashboard/payments", element: <Payments /> },
      { path: "/dashboard/settings", element: <Settings /> },
      { path: "/dashboard/rooms", element: <Rooms /> },
      { path: "/dashboard/courses", element: <Courses /> },
    ],
  },
]);

export default router;
