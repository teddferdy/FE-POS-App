import React from "react";
import { Route } from "react-router-dom";

const BundleList = React.lazy(() => import("@/page/bundle/BundleList"));
const AddBundle = React.lazy(() => import("@/page/bundle/AddBundle"));
const EditBundle = React.lazy(() => import("@/page/bundle/EditBundle"));
const DetailBundle = React.lazy(() => import("@/page/bundle/DetailBundle"));

export const bundleRoutes = (
  <>
    <Route path="/bundle" element={<BundleList />} />
    <Route path="/bundle/add" element={<AddBundle />} />
    <Route path="/bundle/edit/:id" element={<EditBundle />} />
    <Route path="/bundle/:id" element={<DetailBundle />} />
  </>
);
