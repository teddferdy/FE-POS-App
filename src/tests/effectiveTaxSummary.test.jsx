import React from "react";
import { render, screen, waitFor, within, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

// P1 effective-tax summary — read-only consumer of GET /tax-config/effective.
// The backend owns the effective rate and findings; the component renders
// them, never recomputes them, and never presents a failed request as a
// clean configuration.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const mockGetEffectiveTax = jest.fn();
jest.mock("@/services/tax-config", () => ({
  getEffectiveTax: (...args) => mockGetEffectiveTax(...args)
}));

import EffectiveTaxSummary from "@/page/tax-config/components/EffectiveTaxSummary";

const OUTLET = { kind: "outlet", store: 3 };
const GLOBAL = { kind: "global", store: null };

const ok = (data) => Promise.resolve({ success: true, message: "Success get effective tax", data });
const httpError = (status, data = {}) => {
  const err = new Error(`Request failed with status code ${status}`);
  err.response = { status, data };
  return err;
};

const summary = (over = {}) => ({
  store: 3,
  channel: "counter",
  ppn: {
    status: "configured",
    rate: 11,
    rows: [{ id: 1, name: "PPN 11%", rate: 11, scope: "global" }]
  },
  serviceCharge: { status: "absent", rate: 0, rows: [] },
  findings: [],
  ...over
});

const renderSummary = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const utils = render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <EffectiveTaxSummary scope={OUTLET} canViewDetail {...props} />
      </QueryClientProvider>
    </MemoryRouter>
  );
  const rerenderWith = (next) =>
    utils.rerender(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <EffectiveTaxSummary scope={OUTLET} canViewDetail {...props} {...next} />
        </QueryClientProvider>
      </MemoryRouter>
    );
  return { ...utils, rerenderWith, queryClient };
};

beforeEach(() => {
  mockGetEffectiveTax.mockReset();
});

describe("EffectiveTaxSummary — success rendering", () => {
  test("shows the backend effective PPN, service-charge state, and contributing rows", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary()));
    renderSummary();

    const ppn = await screen.findByTestId("effective-ppn-rate");
    expect(ppn).toHaveTextContent("11%");
    expect(mockGetEffectiveTax).toHaveBeenCalledWith({ store: 3, channel: "counter" });
    expect(screen.getByText("page.taxConfig.effective.serviceCharge.absent")).toBeInTheDocument();
    const rows = screen.getByTestId("effective-ppn-rows");
    expect(within(rows).getByText("PPN 11%")).toBeInTheDocument();
    expect(within(rows).getByText("page.taxConfig.scope.global")).toBeInTheDocument();
    expect(screen.getByText("page.taxConfig.effective.findings.none")).toBeInTheDocument();
  });

  test("renders the rate exactly as returned — no frontend summation of rows", async () => {
    // Deliberately inconsistent payload: if the UI summed rows it would show 20%.
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          ppn: {
            status: "configured",
            rate: 13,
            rows: [
              { id: 1, name: "A", rate: 10, scope: "global" },
              { id: 2, name: "B", rate: 10, scope: "outlet" }
            ]
          }
        })
      )
    );
    renderSummary();
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("13%");
  });

  test("contributing rows link to the existing detail page when permitted", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary()));
    renderSummary();
    const link = await screen.findByRole("link", { name: /PPN 11%/ });
    expect(link).toHaveAttribute("href", "/detail-tax?id=1");
  });

  test("without detail permission, rows render as plain text", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary()));
    renderSummary({ canViewDetail: false });
    await screen.findByTestId("effective-ppn-rate");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("PPN 11%")).toBeInTheDocument();
  });
});

describe("EffectiveTaxSummary — findings", () => {
  test("multiple active rows at the same scope: factual warning, pending decision, not labelled invalid", async () => {
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          ppn: {
            status: "configured",
            rate: 22,
            rows: [
              { id: 1, name: "PPN 11%", rate: 11, scope: "global" },
              { id: 7, name: "12", rate: 11, scope: "global" }
            ]
          },
          findings: [
            {
              code: "MULTIPLE_ACTIVE_SAME_SCOPE",
              severity: "warning",
              message: "2 active PPN rows share the global scope; ...",
              policyRef: "D3",
              decision: "undecided"
            }
          ]
        })
      )
    );
    renderSummary();

    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("22%");
    const finding = screen.getByTestId("finding-MULTIPLE_ACTIVE_SAME_SCOPE");
    expect(finding).toHaveAttribute("role", "status");
    expect(
      within(finding).getByText("page.taxConfig.effective.finding.MULTIPLE_ACTIVE_SAME_SCOPE")
    ).toBeInTheDocument();
    expect(
      within(finding).getByText("page.taxConfig.effective.severity.warning")
    ).toBeInTheDocument();
    expect(
      within(finding).getByText("page.taxConfig.effective.finding.pendingDecision")
    ).toBeInTheDocument();
    // Both rows are listed under the global scope group with their count.
    const globalGroup = screen.getByTestId("effective-ppn-rows-global");
    expect(within(globalGroup).getByText("PPN 11%")).toBeInTheDocument();
    expect(within(globalGroup).getByText("12")).toBeInTheDocument();
    expect(within(globalGroup).getByTestId("scope-group-count")).toHaveTextContent("2");
    expect(screen.queryByText(/duplicate|invalid/i)).not.toBeInTheDocument();
  });

  test("global and outlet rows combined: informational, pending decision", async () => {
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          ppn: {
            status: "configured",
            rate: 21,
            rows: [
              { id: 1, name: "PPN Global", rate: 11, scope: "global" },
              { id: 2, name: "PPN Outlet", rate: 10, scope: "outlet" }
            ]
          },
          findings: [
            {
              code: "GLOBAL_AND_OUTLET_COMBINED",
              severity: "info",
              message: "global and outlet PPN rows both contribute; ...",
              policyRef: "D3",
              decision: "undecided"
            }
          ]
        })
      )
    );
    renderSummary();

    const finding = await screen.findByTestId("finding-GLOBAL_AND_OUTLET_COMBINED");
    expect(finding).toHaveAttribute("role", "status");
    expect(within(finding).getByText("page.taxConfig.effective.severity.info")).toBeInTheDocument();
    expect(
      within(finding).getByText("page.taxConfig.effective.finding.pendingDecision")
    ).toBeInTheDocument();
    expect(screen.getByTestId("effective-ppn-rows-outlet")).toHaveTextContent("PPN Outlet");
    expect(screen.getByTestId("effective-ppn-rows-global")).toHaveTextContent("PPN Global");
  });

  test("explicitly configured 0% is shown as configured, distinct from missing PPN", async () => {
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          ppn: {
            status: "configured",
            rate: 0,
            rows: [{ id: 4, name: "PPN 0%", rate: 0, scope: "outlet" }]
          },
          findings: [{ code: "PPN_ZERO_CONFIGURED", severity: "info", message: "..." }]
        })
      )
    );
    renderSummary();

    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("0%");
    expect(
      screen.getByText("page.taxConfig.effective.finding.PPN_ZERO_CONFIGURED")
    ).toBeInTheDocument();
    expect(screen.queryByText("page.taxConfig.effective.ppn.missing")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("a missing-PPN status in a successful response renders an alert without a rate", async () => {
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          ppn: { status: "missing", rate: null, rows: [] },
          findings: [{ code: "PPN_MISSING", severity: "error", message: "..." }]
        })
      )
    );
    renderSummary();

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(screen.getByText("page.taxConfig.effective.ppn.missing")).toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
    expect(screen.getByTestId("finding-PPN_MISSING")).toHaveAttribute("role", "alert");
  });

  test("an unknown finding code still renders with its severity and backend message", async () => {
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          findings: [{ code: "SOMETHING_NEW", severity: "warning", message: "backend says so" }]
        })
      )
    );
    renderSummary();
    const finding = await screen.findByTestId("finding-SOMETHING_NEW");
    expect(within(finding).getByText("backend says so")).toBeInTheDocument();
    expect(
      within(finding).getByText("page.taxConfig.effective.severity.warning")
    ).toBeInTheDocument();
  });
});

describe("EffectiveTaxSummary — channel", () => {
  test("QR channel requests channel=qr and shows service charge as not applicable", async () => {
    mockGetEffectiveTax.mockImplementation(({ channel }) =>
      ok(
        channel === "qr"
          ? summary({
              channel: "qr",
              serviceCharge: { status: "not_applicable", rate: null, rows: [] }
            })
          : summary({
              serviceCharge: {
                status: "configured",
                rate: 5,
                rows: [{ id: 9, name: "Service 5%", rate: 5, scope: "global" }]
              }
            })
      )
    );
    renderSummary();

    expect(await screen.findByTestId("effective-service-charge")).toHaveTextContent("5%");
    const qrButton = screen.getByRole("button", { name: "page.taxConfig.effective.channel.qr" });
    expect(qrButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(qrButton);

    expect(
      await screen.findByText("page.taxConfig.effective.serviceCharge.notApplicable")
    ).toBeInTheDocument();
    expect(mockGetEffectiveTax).toHaveBeenLastCalledWith({ store: 3, channel: "qr" });
    expect(qrButton).toHaveAttribute("aria-pressed", "true");
  });
});

describe("EffectiveTaxSummary — request lifecycle and failures", () => {
  test("shows an accessible loading state while the request is pending", async () => {
    mockGetEffectiveTax.mockReturnValue(new Promise(() => {}));
    renderSummary();
    const status = await screen.findByTestId("effective-tax-loading");
    expect(status).toHaveAttribute("role", "status");
    expect(within(status).getByText("page.taxConfig.effective.loading")).toBeInTheDocument();
    expect(screen.getByRole("region")).toHaveAttribute("aria-busy", "true");
  });

  test("HTTP 400 (including missing-PPN text) is a generic rejection, not classified as missing PPN", async () => {
    mockGetEffectiveTax.mockReturnValue(
      Promise.reject(
        httpError(400, {
          success: false,
          message:
            "PPN tax configuration is missing for this outlet (store 3); configure an active PPN rate before selling"
        })
      )
    );
    renderSummary();

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("page.taxConfig.effective.error.rejected")).toBeInTheDocument();
    // The server's own message is shown verbatim as detail, not reinterpreted.
    expect(within(alert).getByText(/PPN tax configuration is missing/)).toBeInTheDocument();
    expect(screen.queryByText("page.taxConfig.effective.ppn.missing")).not.toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
    expect(screen.queryByText("page.taxConfig.effective.findings.none")).not.toBeInTheDocument();
  });

  test("server failure shows a not-checked error with retry, and retry recovers", async () => {
    mockGetEffectiveTax.mockReturnValue(Promise.reject(httpError(500, { message: "boom" })));
    renderSummary();

    const alert = await screen.findByRole("alert", {}, { timeout: 4000 });
    expect(within(alert).getByText("page.taxConfig.effective.error.failed")).toBeInTheDocument();
    expect(screen.queryByText("page.taxConfig.effective.findings.none")).not.toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();

    mockGetEffectiveTax.mockReturnValue(ok(summary()));
    fireEvent.click(within(alert).getByRole("button", { name: "common.retry" }));
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("11%");
  });

  test("network failure is treated as not checked", async () => {
    mockGetEffectiveTax.mockReturnValue(Promise.reject(new Error("Network Error")));
    renderSummary();
    const alert = await screen.findByRole("alert", {}, { timeout: 4000 });
    expect(within(alert).getByText("page.taxConfig.effective.error.failed")).toBeInTheDocument();
  });

  test("403 shows an access message and no tax data", async () => {
    mockGetEffectiveTax.mockReturnValue(Promise.reject(httpError(403, { message: "denied" })));
    renderSummary();
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("page.taxConfig.effective.error.forbidden")).toBeInTheDocument();
    expect(screen.queryByText("denied")).not.toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rows")).not.toBeInTheDocument();
  });

  test("401 shows a session message and no tax data", async () => {
    mockGetEffectiveTax.mockReturnValue(Promise.reject(httpError(401)));
    renderSummary();
    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText("page.taxConfig.effective.error.unauthorized")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
  });

  test("404 (endpoint not deployed) is a neutral unavailable status, not a clean result", async () => {
    mockGetEffectiveTax.mockReturnValue(Promise.reject(httpError(404)));
    renderSummary();
    expect(
      await screen.findByText("page.taxConfig.effective.error.unavailable")
    ).toBeInTheDocument();
    expect(screen.queryByText("page.taxConfig.effective.findings.none")).not.toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
  });

  test("an unresolved outlet context sends no request", async () => {
    renderSummary({ scope: { kind: "unresolved", store: null } });
    expect(
      await screen.findByText("page.taxConfig.effective.context.unresolved")
    ).toBeInTheDocument();
    expect(mockGetEffectiveTax).not.toHaveBeenCalled();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
  });

  test("global scope requests without a store and says outlet rows are excluded", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary({ store: null })));
    renderSummary({ scope: GLOBAL });
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("11%");
    expect(mockGetEffectiveTax).toHaveBeenCalledWith({ store: null, channel: "counter" });
    expect(screen.getByText("page.taxConfig.effective.context.global")).toBeInTheDocument();
  });

  test("a stale response for a previous outlet never replaces the current outlet's summary", async () => {
    let resolveFirst;
    mockGetEffectiveTax.mockImplementation(({ store }) => {
      if (store === 3) {
        return new Promise((resolve) => {
          resolveFirst = resolve;
        });
      }
      return ok(summary({ store: 4, ppn: { status: "configured", rate: 12, rows: [] } }));
    });
    const { rerenderWith } = renderSummary();
    await waitFor(() => expect(resolveFirst).toBeDefined());

    rerenderWith({ scope: { kind: "outlet", store: 4 } });
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("12%");

    await act(async () => {
      resolveFirst({
        success: true,
        data: summary({ store: 3, ppn: { status: "configured", rate: 99, rows: [] } })
      });
    });
    expect(screen.getByTestId("effective-ppn-rate")).toHaveTextContent("12%");
    expect(screen.queryByText("99%")).not.toBeInTheDocument();
  });

  test("a response for a different context than requested is not rendered", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary({ store: 8 })));
    renderSummary();
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("page.taxConfig.effective.error.mismatch")).toBeInTheDocument();
    expect(screen.queryByTestId("effective-ppn-rate")).not.toBeInTheDocument();
  });
});

describe("EffectiveTaxSummary — detail highlighting and semantics", () => {
  test("marks the current configuration among contributing rows", async () => {
    mockGetEffectiveTax.mockReturnValue(
      ok(
        summary({
          ppn: {
            status: "configured",
            rate: 22,
            rows: [
              { id: 1, name: "PPN 11%", rate: 11, scope: "global" },
              { id: 7, name: "12", rate: 11, scope: "global" }
            ]
          }
        })
      )
    );
    renderSummary({ highlightRowId: 7 });
    const marker = await screen.findByText("page.taxConfig.effective.rows.thisConfig");
    expect(marker.closest("li")).toHaveTextContent("12");
    expect(
      screen.getByText("page.taxConfig.effective.rows.highlightContributes")
    ).toBeInTheDocument();
  });

  test("states when the current configuration does not contribute", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary()));
    renderSummary({ highlightRowId: 55 });
    expect(
      await screen.findByText("page.taxConfig.effective.rows.highlightNotContributing")
    ).toBeInTheDocument();
  });

  test("is a labelled region with a heading and a labelled channel group", async () => {
    mockGetEffectiveTax.mockReturnValue(ok(summary()));
    renderSummary();
    await screen.findByTestId("effective-ppn-rate");
    const region = screen.getByRole("region", { name: "page.taxConfig.effective.title" });
    expect(region).toHaveAttribute("aria-busy", "false");
    expect(
      within(region).getByRole("heading", { name: "page.taxConfig.effective.title" })
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("group", { name: "page.taxConfig.effective.channel.label" })
    ).toBeInTheDocument();
  });
});
