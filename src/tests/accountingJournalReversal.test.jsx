import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import fs from "fs";
import { QueryClient, QueryClientProvider } from "react-query";
import { JournalTab } from "../page/accounting/AccountingPage";
import { getJournals, deleteJournal } from "@/services/accounting";

// FG-ACC-03: "delete" on a manual journal is a reversal. The BE keeps the
// original (status "reversed") and posts a "manual_reversal" mirror entry,
// so the list must show the badge, offer no second reversal, and send the
// optional reason. Keys resolve against the runtime EN dictionary.
const RUNTIME_EN = JSON.parse(fs.readFileSync("public/locales/en/translation.json", "utf8"));
const mockLocale = new Map(Object.entries(RUNTIME_EN));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      const v = mockLocale.get(k);
      if (typeof v !== "string") return k;
      return v.replace(/{{\s*(\w+)\s*}}/g, (m, name) =>
        opts && opts[name] != null ? String(opts[name]) : m
      );
    },
    i18n: { language: "en", changeLanguage: jest.fn() }
  })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));

jest.mock("@/services/accounting", () => ({
  getAccounts: jest.fn(() => Promise.resolve({ data: [] })),
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  getJournals: jest.fn(),
  createManualJournal: jest.fn(),
  deleteJournal: jest.fn(),
  getTrialBalance: jest.fn(),
  getIncomeStatement: jest.fn(),
  getBalanceSheet: jest.fn(),
  getAccountingOverview: jest.fn()
}));

jest.mock("@/queries/useLocations", () => ({
  useLocations: () => ({ data: [] })
}));

jest.mock("@/components/ui/StoreFilter", () => () => null);

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const entry = (overrides) => ({
  store: 1,
  date: "2026-10-01",
  description: "",
  totalDebit: "1000000.00",
  totalCredit: "1000000.00",
  lines: [],
  ...overrides
});

const renderTab = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JournalTab storeId="1" isAll={false} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  getJournals.mockResolvedValue({
    data: [
      entry({ id: 1, entryNumber: "JV-0001-000001", sourceType: "manual", status: "posted" }),
      entry({ id: 2, entryNumber: "JV-0001-000002", sourceType: "manual", status: "reversed" }),
      entry({
        id: 3,
        entryNumber: "JV-0001-000003",
        sourceType: "manual_reversal",
        status: "posted",
        description: "Reversal of JV-0001-000002"
      })
    ],
    count: 3
  });
  deleteJournal.mockResolvedValue({ success: true });
});

test("a reversed journal is badged and offers no second reversal", async () => {
  renderTab();
  await screen.findByText("JV-0001-000002");
  expect(screen.getAllByText("Reversed")).toHaveLength(1);
  expect(screen.getByText("Manual Reversal")).toBeInTheDocument();
  // Only the posted manual entry can be reversed.
  expect(screen.getAllByTitle("Reverse")).toHaveLength(1);
});

test("reversing explains that nothing is deleted and sends the reason", async () => {
  renderTab();
  await screen.findByText("JV-0001-000001");
  fireEvent.click(screen.getByTitle("Reverse"));

  expect(await screen.findByText(/Journal JV-0001-000001 is not deleted/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Reason (optional)"), {
    target: { value: "  wrong amount  " }
  });
  fireEvent.click(screen.getByRole("button", { name: "Reverse" }));

  await waitFor(() => expect(deleteJournal).toHaveBeenCalledWith(1, "wrong amount"));
});
