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
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/teachers",  element: <Teachers /> },
      { path: "/groups",    element: <Groups /> },
      { path: "/students",  element: <Students /> },
      { path: "/payments",  element: <Payments /> },
      { path: "/settings",  element: <Settings /> },
      { path: "/rooms",     element: <Rooms /> },
      { path: "/courses",   element: <Courses /> },
    ],
  },
]);

export default router;
