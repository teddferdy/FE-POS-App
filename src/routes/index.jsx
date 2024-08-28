/* eslint-disable react/react-in-jsx-scope */
import { createBrowserRouter } from "react-router-dom";

// Auth
import Login from "../page/auth/login";
import Register from "../page/auth/register";
import ResetPassword from "../page/auth/reset-password";
import EditProfile from "../page/auth/edit-profile";

// Cashier
import ListProduct from "../page/cashier/list-product"; // List Product Cashier
import MemberCashier from "../page/cashier/member-cashier";

// Admin
import OverviewPage from "../page/admin/overview";

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
    path: "/edit-profile",
    element: <EditProfile />
  },

  // User -> List Product
  {
    path: "/home",
    element: <ListProduct />
  },

  // User -> Member
  {
    path: "/membership",
    element: <MemberCashier />
  },
  {
    path: "/admin-page",
    element: <OverviewPage />
  }
]);
