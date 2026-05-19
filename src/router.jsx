import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout, { Teachers, Groups, Students, Payments, Settings, Rooms, Courses } from "./components/MainLayout";

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
    element: <MainLayout />,
    children: [
      { path: "/dashboard",          element: <Dashboard /> },
      { path: "/dashboard/teachers", element: <Teachers /> },
      { path: "/dashboard/groups",   element: <Groups /> },
      { path: "/dashboard/students", element: <Students /> },
      { path: "/dashboard/payments", element: <Payments /> },
      { path: "/dashboard/settings", element: <Settings /> },
      { path: "/dashboard/rooms",    element: <Rooms /> },
      { path: "/dashboard/courses",  element: <Courses /> },
    ],
  },
]);

export default router;
