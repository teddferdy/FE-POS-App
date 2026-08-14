import { buildDashboardQueryParams } from "@/lib/dashboard-query";

describe("buildDashboardQueryParams", () => {
  test("includes the selected store id so all dashboard sections filter by it", () => {
    const params = buildDashboardQueryParams({
      storeFilter: "5",
      dateRange: { startDate: "2026-08-01T00:00:00.000Z", endDate: "2026-08-14T23:59:59.999Z" }
    });
    expect(params).toEqual({
      store: "5",
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-08-14T23:59:59.999Z"
    });
  });

  test("omits store when no store is selected (all stores)", () => {
    const params = buildDashboardQueryParams({ storeFilter: null, dateRange: {} });
    expect(params.store).toBeUndefined();
  });

  test("omits empty date range bounds", () => {
    const params = buildDashboardQueryParams({
      storeFilter: "5",
      dateRange: { startDate: "", endDate: null }
    });
    expect(params).toEqual({ store: "5" });
  });
});
