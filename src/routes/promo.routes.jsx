import React from "react";
import { Route } from "react-router-dom";

const PromoCampaignList = React.lazy(() => import("@/page/promo/PromoCampaignList"));
const AddPromoCampaign = React.lazy(() => import("@/page/promo/AddPromoCampaign"));
const EditPromoCampaign = React.lazy(() => import("@/page/promo/EditPromoCampaign"));
const PromoCampaignDetail = React.lazy(() => import("@/page/promo/PromoCampaignDetail"));

export const promoRoutes = (
  <>
    <Route path="/promo-list" element={<PromoCampaignList />} />
    <Route path="/add-promo" element={<AddPromoCampaign />} />
    <Route path="/edit-promo" element={<EditPromoCampaign />} />
    <Route path="/detail-promo" element={<PromoCampaignDetail />} />
  </>
);
