import React from "react";
import { Navigate, Route } from "react-router-dom";
import { isPublicRegistrationEnabled } from "@/utils/publicRegistration";

const LoginPage = React.lazy(() => import("@/page/auth/login"));
const Register = React.lazy(() => import("@/page/auth/register"));
const ResetPassword = React.lazy(() => import("@/page/auth/reset-password"));

export const authRoutes = (
  <>
    <Route path="/" element={<LoginPage />} />
    {/* D-08: closed sign-up sends old links/bookmarks back to login. */}
    <Route
      path="/register"
      element={isPublicRegistrationEnabled() ? <Register /> : <Navigate to="/" replace />}
    />
    <Route path="/reset-password" element={<ResetPassword />} />
  </>
);
