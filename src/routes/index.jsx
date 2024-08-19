/* eslint-disable react/react-in-jsx-scope */
import { createBrowserRouter } from "react-router-dom";
// Pages
import Home from "../page/home";
import Register from "../page/auth/register";
import ResetPassword from "../page/auth/reset-password";
import Login from "../page/auth/login";
import AdminPage from "../page/admin";

export const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/admin-page",
    element: <AdminPage />
  }
]);
