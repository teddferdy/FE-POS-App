import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditProfileModal from "../components/organism/edit-profile-modal";
import { editProfile } from "../services/auth";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

const mockSetCookie = jest.fn();
jest.mock("react-cookie", () => ({
  useCookies: () => [{}, (...args) => mockSetCookie(...args)]
}));

jest.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ date, setDate }) => (
    <input
      aria-label="date-of-birth"
      value={date ? date.toISOString() : ""}
      onChange={(e) => setDate && setDate(new Date(e.target.value))}
    />
  )
}));

// Radix Select needs pointer-capture APIs jsdom doesn't implement; a plain
// native select is behaviorally equivalent for what this test asserts.
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }) => (
    <select aria-label="gender" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ value, children }) => <option value={value}>{children}</option>
}));

jest.mock("../services/auth", () => ({
  editProfile: jest.fn()
}));

const user = {
  id: 42,
  email: "jane@example.com",
  fullName: "Jane Doe",
  userName: "janedoe",
  phoneNumber: "0800000000",
  address: "Jl. Merdeka",
  gender: "Perempuan",
  roleType: "kasir",
  accessMenu: ["cashier"]
};

describe("EditProfileModal", () => {
  beforeEach(() => {
    editProfile.mockReset();
    mockSetCookie.mockReset();
    editProfile.mockResolvedValue({
      token: "new-token",
      user: { ...user, fullName: "Jane D. Updated" }
    });
    sessionStorage.clear();
  });

  test("submits the caller's own email and current field values, never lets it be edited away", async () => {
    const onSuccess = jest.fn();
    render(<EditProfileModal open user={user} onOpenChange={jest.fn()} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(editProfile).toHaveBeenCalledTimes(1));
    const payload = editProfile.mock.calls[0][0];
    expect(payload.email).toBe("jane@example.com");
    expect(payload.fullName).toBe("Jane Doe");
  });

  test("on success, refreshes the token/user cookies and calls onSuccess with the merged user", async () => {
    const onSuccess = jest.fn();
    const onOpenChange = jest.fn();
    render(<EditProfileModal open user={user} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(editProfile).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    expect(mockSetCookie).toHaveBeenCalledWith("token", "new-token", { path: "/" });
    const userCookieCall = mockSetCookie.mock.calls.find((c) => c[0] === "user");
    expect(userCookieCall[1]).not.toHaveProperty("accessMenu");
    expect(userCookieCall[1].fullName).toBe("Jane D. Updated");
    expect(onSuccess.mock.calls[0][0].fullName).toBe("Jane D. Updated");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("rejects submit when full name is cleared, without calling the API", async () => {
    render(<EditProfileModal open user={user} onOpenChange={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.change(screen.getByDisplayValue("Jane Doe"), { target: { value: "   " } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(editProfile).not.toHaveBeenCalled());
  });

  test("keeps the modal open (never calls onOpenChange) when validation fails", async () => {
    const onOpenChange = jest.fn();
    render(<EditProfileModal open user={user} onOpenChange={onOpenChange} onSuccess={jest.fn()} />);

    fireEvent.change(screen.getByDisplayValue("Jane Doe"), { target: { value: "   " } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(editProfile).not.toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test("keeps the modal open when the API call fails", async () => {
    editProfile.mockRejectedValue(new Error("network down"));
    const onOpenChange = jest.fn();
    render(<EditProfileModal open user={user} onOpenChange={onOpenChange} onSuccess={jest.fn()} />);

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(editProfile).toHaveBeenCalledTimes(1));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
