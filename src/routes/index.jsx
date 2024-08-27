/* eslint-disable react/react-in-jsx-scope */
import { createBrowserRouter } from "react-router-dom";

// Auth
import Login from "../page/auth/login";
import Register from "../page/auth/register";
import ResetPassword from "../page/auth/reset-password";

// Cashier
import Home from "../page/home"; // List Product Cashier
import MemberCashier from "../page/cashier/member";

// Admin
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

  // User -> List Product
  {
    path: "/home",
    element: <Home />
  },

  // User -> Member
  {
    path: "/membership",
    element: <MemberCashier />
  },
  {
    path: "/admin-page",
    element: <AdminPage />
  }
]);
