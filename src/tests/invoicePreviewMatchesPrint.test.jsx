import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import InvoicePage from "../page/invoice/InvoicePage";
import { printViaBrowser } from "@/utils/thermalPrint";
import { renderReceiptElement } from "@/utils/receiptDocument";

// User report: the invoice-settings preview and the printed receipt were
// two different designs. The preview now mounts the exact element the
// print receives; this pins it, including saved settings (paper size,
// footer, hidden social account).

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 7, userName: "sari" } }, jest.fn()]
}));
jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ setActiveStore: jest.fn(), isSuperAdmin: false })
}));
jest.mock("@/queries/useLocations", () => ({
  useLocations: () => ({ data: { data: [] }, isLoading: false })
}));
jest.mock("@/utils/thermalPrint", () => ({ printViaBrowser: jest.fn() }));
jest.mock("@/services/invoice", () => ({
  getInvoiceSetting: jest.fn(() =>
    Promise.resolve({
      data: { paperSize: "80mm", footer: "Makasih ya", socialMediaVisibility: { 1: false } }
    })
  ),
  updateInvoiceSetting: jest.fn(),
  resetInvoiceSetting: jest.fn()
}));
jest.mock("@/services/location", () => ({
  getLocationById: jest.fn(() =>
    Promise.resolve({
      data: {
        id: 7,
        name: "Warung A",
        address: "Jl. Melati 5",
        phoneNumber: "0812",
        socialMedia: [
          { platform: "Instagram", account: "@warunga" },
          { platform: "TikTok", account: "@warunga.tt" }
        ]
      }
    })
  )
}));
jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() => Promise.resolve([])),
  getCities: jest.fn(() => Promise.resolve([])),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));

test("the invoice preview is exactly the receipt that gets printed", async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <InvoicePage />
      </MemoryRouter>
    </QueryClientProvider>
  );

  const paper = await screen.findByTestId("receipt-paper");
  await waitFor(() => expect(paper).toHaveTextContent("Warung A"));
  await waitFor(() => expect(paper).toHaveTextContent("Makasih ya"));
  expect(paper).toHaveTextContent("Instagram: @warunga");
  expect(paper).not.toHaveTextContent("TikTok");
  expect(paper.querySelector("[data-receipt]")).toHaveAttribute("data-receipt", "80mm");

  fireEvent.click(screen.getByText("page.invoice.printPreview"));
  expect(printViaBrowser).toHaveBeenCalledTimes(1);
  const printed = printViaBrowser.mock.calls[0][0];
  expect(renderReceiptElement(printed).outerHTML).toBe(paper.innerHTML);

  // The PDF button prints the same receipt (Save as PDF in the dialog),
  // not the whole settings page.
  fireEvent.click(screen.getByText("PDF"));
  expect(printViaBrowser).toHaveBeenCalledTimes(2);
  expect(printViaBrowser.mock.calls[1][0]).toBe(printed);
});
