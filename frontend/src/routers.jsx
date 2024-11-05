import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/DashBoard";
import EditPresentation from './components/EditPresentation';

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: '/dashboard', element: <Dashboard /> }, 
  { path: "/presentations/:id", element: <EditPresentation /> },
]);

export default router;
