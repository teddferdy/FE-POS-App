import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddMember from "../page/member/AddMember";

// Field-length standard (BA DR-28) on a real form: each field carries the
// limit of its kind and shows the counter.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 1 } }]
}));
jest.mock("@/services/member", () => ({ addMember: jest.fn() }));
jest.mock("@/services/member-tier", () => ({
  getAllMemberTier: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock(
  "@/components/organism/UserGuide",
  () =>
    function UserGuideStub() {
      return null;
    }
);

test("the member form limits name 100, email 254, phone 20, address 255", () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AddMember />
    </QueryClientProvider>
  );
  const limits = [...document.querySelectorAll("input[maxlength], textarea[maxlength]")].map((el) =>
    Number(el.getAttribute("maxlength"))
  );
  expect(limits).toEqual(expect.arrayContaining([100, 254, 20, 255]));
  for (const max of [100, 254, 20, 255])
    expect(screen.getAllByText(`0/${max}`).length).toBeGreaterThan(0);
});
