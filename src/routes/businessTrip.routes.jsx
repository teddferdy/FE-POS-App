import React from "react";
import { Route } from "react-router-dom";

import { RequireRole } from "@/components/ui/RequireRole";

const BusinessTripList = React.lazy(() => import("@/page/business-trip/BusinessTripList"));
const AddBusinessTrip = React.lazy(() => import("@/page/business-trip/AddBusinessTrip"));
const EditBusinessTrip = React.lazy(() => import("@/page/business-trip/EditBusinessTrip"));
const DetailBusinessTrip = React.lazy(() => import("@/page/business-trip/DetailBusinessTrip"));

export const businessTripRoutes = (
  <>
    <Route
      path="/business-trip"
      element={
        <RequireRole roles={["super_admin", "admin"]}>
          <BusinessTripList />
        </RequireRole>
      }
    />
    <Route
      path="/add-business-trip"
      element={
        <RequireRole roles={["super_admin", "admin"]}>
          <AddBusinessTrip />
        </RequireRole>
      }
    />
    <Route
      path="/edit-business-trip"
      element={
        <RequireRole roles={["super_admin", "admin"]}>
          <EditBusinessTrip />
        </RequireRole>
      }
    />
    <Route
      path="/business-trip/detail"
      element={
        <RequireRole roles={["super_admin", "admin"]}>
          <DetailBusinessTrip />
        </RequireRole>
      }
    />
  </>
);
