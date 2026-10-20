import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RegisterRequiredDialog from "../components/organism/RegisterRequiredDialog";
import { isRegisterRequiredError, useRegisterRequiredStore } from "../state/registerRequired";

// Client request: a sale refused with 422 REGISTER_REQUIRED shows a dialog;
// OK sends the cashier to /cash-register/open-close.

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));

const apiError = (status, data) => ({ response: { status, data } });

beforeEach(() => act(() => useRegisterRequiredStore.getState().hide()));

test("recognises only the 422 REGISTER_REQUIRED refusal", () => {
  expect(
    isRegisterRequiredError(
      apiError(422, {
        error: "No open cash register for this store; open a register before settling",
        code: "REGISTER_REQUIRED"
      })
    )
  ).toBe(true);
  expect(isRegisterRequiredError(apiError(422, { code: "TOTAL_CHANGED" }))).toBe(false);
  expect(isRegisterRequiredError(apiError(500, { code: "REGISTER_REQUIRED" }))).toBe(false);
  expect(isRegisterRequiredError(new Error("network"))).toBe(false);
});

const renderApp = () =>
  render(
    <MemoryRouter initialEntries={["/home"]}>
      <RegisterRequiredDialog />
      <Routes>
        <Route path="/home" element={<div>cashier page</div>} />
        <Route path="/cash-register/open-close" element={<div>open register page</div>} />
      </Routes>
    </MemoryRouter>
  );

test("hidden until a refusal opens it; OK goes to the open-register page", () => {
  renderApp();
  expect(screen.queryByText("registerRequired.title")).not.toBeInTheDocument();

  act(() => useRegisterRequiredStore.getState().show());
  expect(screen.getByText("registerRequired.title")).toBeInTheDocument();

  fireEvent.click(screen.getByText("registerRequired.ok"));
  expect(screen.getByText("open register page")).toBeInTheDocument();
  expect(useRegisterRequiredStore.getState().open).toBe(false);
});

test("Nanti closes it and stays on the page", () => {
  renderApp();
  act(() => useRegisterRequiredStore.getState().show());
  fireEvent.click(screen.getByText("registerRequired.later"));
  expect(screen.queryByText("registerRequired.title")).not.toBeInTheDocument();
  expect(screen.getByText("cashier page")).toBeInTheDocument();
});
