import { useQuery } from "react-query";
import { getAllLocation } from "@/services/location";
import { qk } from "./keys";
import { REFERENCE } from "./policies";

// Store list (GET /location/get-location-public). `status`: "active"
// (default, what the BE returns without a status) or "all" (archived too).
// Returns the plain useQuery result, so call sites keep their destructuring;
// `options` (enabled, select, onSuccess, retry …) override the policy.
export const useLocations = (status = "active", options = {}) =>
  useQuery(qk.locations.list(status), () => getAllLocation(status === "all" ? "all" : undefined), {
    ...REFERENCE,
    ...options
  });
