import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditProfileModal from "../components/organism/edit-profile-modal";
import { editProfile } from "../services/auth";

// A profile edit returns a freshly signed token. If that response lands after
// the session boundary started, writing it would bring the old session back
// after the reload — the success path must write nothing.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockSetCookie = jest.fn();
jest.mock("react-cookie", () => ({
  useCookies: () => [{}, (...args) => mockSetCookie(...args)]
}));

jest.mock("@/components/ui/date-picker", () => ({
  DatePicker: () => null
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children }) => <>{children}</>,
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ children }) => <>{children}</>
}));
jest.mock("../services/auth", () => ({ editProfile: jest.fn() }));

let mockEnding = false;
jest.mock("@/services/session", () => ({ isSessionEnding: () => mockEnding }));

const user = { id: 42, email: "jane@example.com", fullName: "Jane Doe", userName: "janedoe" };

beforeEach(() => {
  mockSetCookie.mockReset();
  editProfile.mockReset();
  editProfile.mockResolvedValue({ token: "fresh-token-A", user: { ...user, fullName: "Jane 2" } });
  sessionStorage.clear();
});

test("a profile-edit success landing during the session boundary writes no credentials", async () => {
  const onSuccess = jest.fn();
  render(<EditProfileModal open user={user} onOpenChange={jest.fn()} onSuccess={onSuccess} />);

  mockEnding = true;
  fireEvent.click(screen.getByText("common.save"));

  await waitFor(() => expect(editProfile).toHaveBeenCalledTimes(1));
  await new Promise((r) => setTimeout(r, 0));

  expect(mockSetCookie).not.toHaveBeenCalled();
  expect(sessionStorage.getItem("user")).toBeNull();
  expect(onSuccess).not.toHaveBeenCalled();
});

test("outside a boundary the success path is unchanged", async () => {
  mockEnding = false;
  const onSuccess = jest.fn();
  render(<EditProfileModal open user={user} onOpenChange={jest.fn()} onSuccess={onSuccess} />);

  fireEvent.click(screen.getByText("common.save"));

  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  expect(mockSetCookie).toHaveBeenCalledWith("token", "fresh-token-A", { path: "/" });
});
