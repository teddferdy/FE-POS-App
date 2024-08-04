import { createBrowserRouter } from "react-router-dom";
// Pages
import Home from "../page/home";
import Register from "../page/auth/register";
import ResetPassword from "../page/auth/reset-password";
import Login from "../page/auth/login";

export const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);
