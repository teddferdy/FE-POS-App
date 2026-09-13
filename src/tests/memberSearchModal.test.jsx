import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import MemberSearchModal from "../components/MemberSearchModal";
import * as memberService from "@/services/member";

jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1" }]
}));

jest.mock("@/services/member", () => ({
  getAllMember: jest.fn()
}));

const renderModal = (onSelect = jest.fn(), onClose = jest.fn()) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemberSearchModal open={true} onClose={onClose} onSelect={onSelect} />
    </QueryClientProvider>
  );
};

describe("MemberSearchModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders search inputs and button", () => {
    renderModal();
    expect(screen.getByText("Cari Member")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nomor HP / Member")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nama member")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  test("search by member number", async () => {
    memberService.getAllMember.mockResolvedValue({
      data: [{ id: 1, name: "Budi", phoneNumber: "081234", point: 120, status: "Aktif" }]
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText("Nomor HP / Member"), {
      target: { value: "081234" }
    });
    fireEvent.click(screen.getByText("Search"));
    await waitFor(() =>
      expect(memberService.getAllMember).toHaveBeenCalledWith(
        expect.objectContaining({ phoneNumber: "081234" })
      )
    );
  });

  test("search by name", async () => {
    memberService.getAllMember.mockResolvedValue({
      data: [{ id: 2, name: "Siti", phoneNumber: "081235", point: 50, status: "Aktif" }]
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText("Nama member"), { target: { value: "Siti" } });
    fireEvent.click(screen.getByText("Search"));
    await waitFor(() =>
      expect(memberService.getAllMember).toHaveBeenCalledWith(
        expect.objectContaining({ nameMember: "Siti" })
      )
    );
  });

  test("shows loading", async () => {
    memberService.getAllMember.mockImplementation(() => new Promise(() => {}));
    renderModal();
    fireEvent.change(screen.getByPlaceholderText("Nama member"), { target: { value: "Budi" } });
    fireEvent.click(screen.getByText("Search"));
    expect(await screen.findByText("Mencari member...")).toBeInTheDocument();
  });

  test("shows empty", async () => {
    memberService.getAllMember.mockResolvedValue({ data: [] });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText("Nama member"), { target: { value: "Unknown" } });
    fireEvent.click(screen.getByText("Search"));
    await waitFor(() => expect(screen.getByText("Member tidak ditemukan.")).toBeInTheDocument());
  });

  test("click row selects member and closes", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    memberService.getAllMember.mockResolvedValue({
      data: [{ id: 1, name: "Budi", phoneNumber: "081234", point: 120, status: "Aktif" }]
    });
    renderModal(onSelect, onClose);
    fireEvent.change(screen.getByPlaceholderText("Nama member"), { target: { value: "Budi" } });
    fireEvent.click(screen.getByText("Search"));
    await waitFor(() => expect(screen.getByText("Budi")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Budi"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: "Budi" }));
    expect(onClose).toHaveBeenCalled();
  });
});
