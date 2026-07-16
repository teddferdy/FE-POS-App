import React from "react";
import { Route } from "react-router-dom";

const LoginPage = React.lazy(() => import("@/page/auth/login"));
const Register = React.lazy(() => import("@/page/auth/register"));
const ResetPassword = React.lazy(() => import("@/page/auth/reset-password"));

export const authRoutes = (
  <>
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
  </>
);
