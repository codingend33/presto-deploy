import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/DashBoard";
import EditPresentation from "./components/EditPresentation";
import Logout from "./pages/Logout";
import NotFound from "./pages/404";
import PreviewViewing from "./components/PreviewViewing";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/logout", element: <Logout /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/presentations/:id", element: <EditPresentation /> },
  { path: "*", element: <NotFound /> },
  { path: "/preview/:id", element: <PreviewViewing /> },
]);

export default router;
