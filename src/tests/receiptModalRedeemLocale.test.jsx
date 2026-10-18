import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import fs from "fs";
import { QueryClient, QueryClientProvider } from "react-query";
import ReceiptModal from "../page/cashier/components/ReceiptModal";

// The points-redemption block of the receipt summary used hardcoded mixed
// copy ("Redeem Point (… Poin)", "Total sebelum redeem"), so English-locale
// cashiers saw Indonesian text. The translator below resolves keys against the
// runtime dictionaries (public/locales) with {{var}} interpolation, so the
// rendered text is what each locale actually shows.
//
// Paths below are repo-relative string literals: jest always runs from the
// repository root (locally and in CI), so no path computation is needed.
const RUNTIME_EN = JSON.parse(fs.readFileSync("public/locales/en/translation.json", "utf8"));
const RUNTIME_ID = JSON.parse(fs.readFileSync("public/locales/id/translation.json", "utf8"));
const MIRROR_EN = JSON.parse(fs.readFileSync("src/i18n/en.json", "utf8"));
const MIRROR_ID = JSON.parse(fs.readFileSync("src/i18n/id.json", "utf8"));
const mockLocales = {
  en: new Map(Object.entries(RUNTIME_EN)),
  id: new Map(Object.entries(RUNTIME_ID))
};
const mockState = { lng: "en" };

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      const v = (mockState.lng === "id" ? mockLocales.id : mockLocales.en).get(k);
      if (typeof v !== "string") return k;
      return v.replace(/{{\s*(\w+)\s*}}/g, (m, name) =>
        opts && opts[name] != null ? String(opts[name]) : m
      );
    },
    i18n: { language: mockState.lng, changeLanguage: jest.fn() }
  })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("@/utils/thermalPrint", () => ({ printReceipt: jest.fn() }));

jest.mock("@/services/invoice", () => ({
  getInvoiceSetting: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("@/services/location", () => ({
  getLocationById: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() => Promise.resolve([])),
  getCities: jest.fn(() => Promise.resolve([])),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));
jest.mock("@/services/type-payment", () => ({
  getAllTypePayment: jest.fn(() =>
    Promise.resolve({ data: [{ type: "cash", name: "Cash", status: "active" }] })
  )
}));
jest.mock("../services/split-bill", () => ({
  createSplitBill: jest.fn(() => Promise.resolve({ data: [] })),
  getSplitBillByOrder: jest.fn(() => Promise.resolve({ data: null })),
  paySplitBill: jest.fn(),
  cancelSplitBill: jest.fn(),
  mergeSplitBills: jest.fn()
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 7 }, activeStore: 7 }]
}));

const REDEEM_ORDER = {
  id: 701,
  orderNumber: "ORD-701",
  total: 48500,
  items: [],
  redeemedPoints: 1500
};

const renderModal = (lng, orderData = REDEEM_ORDER) => {
  mockState.lng = lng;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReceiptModal data={orderData} onClose={jest.fn()} onNewTransaction={jest.fn()} />
    </QueryClientProvider>
  );
};

describe("ReceiptModal points-redemption block localization", () => {
  test("English locale renders English redeem labels with the unchanged amounts", () => {
    renderModal("en");

    const redeemLabel = screen.getByText("Redeem Points (1.500 points)");
    expect(redeemLabel.parentElement).toHaveTextContent("-Rp1.500");

    const beforeLabel = screen.getByText("Total before redemption");
    expect(beforeLabel.parentElement).toHaveTextContent("Rp50.000");

    expect(screen.queryByText(/Total sebelum redeem/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Poin\)/)).not.toBeInTheDocument();
  });

  test("Indonesian locale renders Indonesian redeem labels with the unchanged amounts", () => {
    renderModal("id");

    const redeemLabel = screen.getByText("Redeem Poin (1.500 Poin)");
    expect(redeemLabel.parentElement).toHaveTextContent("-Rp1.500");

    const beforeLabel = screen.getByText("Total sebelum redeem");
    expect(beforeLabel.parentElement).toHaveTextContent("Rp50.000");
  });

  test("customer.redeemedPoints fallback drives the same localized label", () => {
    renderModal("en", {
      ...REDEEM_ORDER,
      redeemedPoints: 0,
      customer: { redeemedPoints: 2000 }
    });

    expect(screen.getByText("Redeem Points (2.000 points)")).toBeInTheDocument();
  });

  test("no redeem block renders when no points were redeemed", () => {
    renderModal("en", { ...REDEEM_ORDER, redeemedPoints: 0 });

    expect(screen.queryByText(/Redeem Points/)).not.toBeInTheDocument();
    expect(screen.queryByText("Total before redemption")).not.toBeInTheDocument();
  });
});

describe("receipt redeem dictionary keys", () => {
  // Runtime layer (public/locales) is what the app loads; src/i18n mirrors it.
  test.each([
    ["public/locales/en/translation.json", RUNTIME_EN],
    ["src/i18n/en.json", MIRROR_EN]
  ])("%s carries the English redeem copy", (_file, dict) => {
    expect(dict["page.cashier.receipt.redeemPoints"]).toBe("Redeem Points ({{points}} points)");
    expect(dict["page.cashier.receipt.totalBeforeRedeem"]).toBe("Total before redemption");
  });

  test.each([
    ["public/locales/id/translation.json", RUNTIME_ID],
    ["src/i18n/id.json", MIRROR_ID]
  ])("%s carries the Indonesian redeem copy", (_file, dict) => {
    expect(dict["page.cashier.receipt.redeemPoints"]).toBe("Redeem Poin ({{points}} Poin)");
    expect(dict["page.cashier.receipt.totalBeforeRedeem"]).toBe("Total sebelum redeem");
  });
});
