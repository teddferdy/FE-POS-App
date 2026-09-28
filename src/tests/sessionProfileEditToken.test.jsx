import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditProfileModal from "../components/organism/edit-profile-modal";
import { editProfile } from "../services/auth";
import { axiosInstance } from "../services/index";
import { getToken } from "../utils/cookies";

// KF-NEW-11 / TP-13: PUT /auth/edit-user answers with a token signed from
// `{id, sessionId}` only. Adopting it drops roleType/roleId/store, so every
// role-gated request after a profile edit is denied until re-login. Profile
// edit changes no authentication or authorization state, so the session
// token from login must survive it byte-for-byte.

jest.mock("@/utils/endpoints", () => ({
  ENDPOINT: { BASE_URL: "http://api.test" }
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Writes through to document.cookie like react-cookie does, so a token
// replacement would be visible to getToken() and the request interceptor.
const mockSetCookie = jest.fn((name, value) => {
  const raw = typeof value === "string" ? value : encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${raw}; path=/`;
});
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

const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const fakeJwt = (claims) => `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(claims)}.sig`;
const claimsOf = (token) =>
  JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

const SESSION_ID = "a".repeat(64);
const loginClaims = {
  id: 42,
  userName: "janedoe",
  fullName: "Jane Doe",
  roleType: "admin",
  roleId: 7,
  store: 3,
  sessionId: SESSION_ID,
  iat: 1790000000,
  exp: 1790086400
};
const loginToken = fakeJwt(loginClaims);
// Exactly what the backend's editUser signs today (auth.js).
const downgradedToken = fakeJwt({
  id: 42,
  sessionId: SESSION_ID,
  iat: 1790000500,
  exp: 1790086900
});

const user = {
  id: 42,
  email: "jane@example.com",
  fullName: "Jane Doe",
  userName: "janedoe",
  roleType: "admin",
  store: 3
};

const expireCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

let sentHeaders;

beforeEach(() => {
  document.cookie = `token=${loginToken}; path=/`;
  sessionStorage.clear();
  mockSetCookie.mockClear();
  editProfile.mockReset();
  editProfile.mockResolvedValue({
    message: "Success Login",
    token: downgradedToken,
    user: { ...user, fullName: "Jane D. Updated" }
  });
  sentHeaders = [];
  axiosInstance.defaults.adapter = (config) => {
    sentHeaders.push(config.headers);
    return Promise.resolve({ status: 200, statusText: "OK", data: {}, headers: {}, config });
  };
});

afterEach(() => {
  expireCookie("token");
  expireCookie("user");
});

const editProfileSuccessfully = async () => {
  const onSuccess = jest.fn();
  render(<EditProfileModal open user={user} onOpenChange={jest.fn()} onSuccess={onSuccess} />);
  fireEvent.click(screen.getByText("common.save"));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  return onSuccess;
};

test("a successful profile edit keeps the login session token byte-for-byte", async () => {
  const onSuccess = await editProfileSuccessfully();

  expect(onSuccess.mock.calls[0][0].fullName).toBe("Jane D. Updated");
  expect(getToken()).toBe(loginToken);
  expect(mockSetCookie).not.toHaveBeenCalledWith("token", expect.anything(), expect.anything());
});

test("the next role-gated request still carries the pre-edit authorization claims", async () => {
  await editProfileSuccessfully();

  await axiosInstance.get("/employee/get-all-employee");

  expect(sentHeaders).toHaveLength(1);
  expect(sentHeaders[0].Authorization).toBe(`Bearer ${loginToken}`);
  const sent = claimsOf(sentHeaders[0].Authorization.substring(7));
  expect(sent.id).toBe(loginClaims.id);
  expect(sent.roleType).toBe("admin");
  expect(sent.roleId).toBe(7);
  expect(sent.store).toBe(3);
  expect(sent.sessionId).toBe(SESSION_ID);
});

test("a token in the edit response can never broaden the session's privileges", async () => {
  editProfile.mockResolvedValue({
    token: fakeJwt({ ...loginClaims, roleType: "super_admin", store: null }),
    user: { ...user, fullName: "Jane D. Updated" }
  });

  await editProfileSuccessfully();
  await axiosInstance.get("/employee/get-all-employee");

  expect(getToken()).toBe(loginToken);
  const sent = claimsOf(sentHeaders[0].Authorization.substring(7));
  expect(sent.roleType).toBe("admin");
  expect(sent.store).toBe(3);
});
