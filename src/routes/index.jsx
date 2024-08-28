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
import CategoryList from "../page/admin/category";
import LocationList from "../page/admin/location";
import MemberList from "../page/admin/member";
import ProductList from "../page/admin/product";

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

  // Admin Page
  {
    path: "/admin-page",
    element: <OverviewPage />
  },
  {
    path: "/category-list",
    element: <CategoryList />
  },
  {
    path: "/location-list",
    element: <LocationList />
  },
  // Member List Admin
  {
    path: "/member-list",
    element: <MemberList />
  },
  {
    path: "/product-list",
    element: <ProductList />
  }
]);
