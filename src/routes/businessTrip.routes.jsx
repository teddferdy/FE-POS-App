import React from "react";
import { Route } from "react-router-dom";

const BusinessTripList = React.lazy(() => import("@/page/business-trip/BusinessTripList"));
const AddBusinessTrip = React.lazy(() => import("@/page/business-trip/AddBusinessTrip"));
const EditBusinessTrip = React.lazy(() => import("@/page/business-trip/EditBusinessTrip"));
const DetailBusinessTrip = React.lazy(() => import("@/page/business-trip/DetailBusinessTrip"));

export const businessTripRoutes = (
  <>
    <Route path="/business-trip" element={<BusinessTripList />} />
    <Route path="/add-business-trip" element={<AddBusinessTrip />} />
    <Route path="/edit-business-trip" element={<EditBusinessTrip />} />
    <Route path="/business-trip/detail" element={<DetailBusinessTrip />} />
  </>
);
