import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AbortController, { forbiddenKind } from "../components/organism/abort-controller";

// Observed 2026-10-19: /dashboard-admin for an admin without a store got
// 403 "Store assignment required" and showed "Terjadi Kesalahan Server" with
// a "Coba lagi" button that can never succeed.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const axios403 = (data) => ({ response: { status: 403, data } });

describe("forbiddenKind", () => {
  test.each([
    [axios403({ message: "Store assignment required" }), "noStore"],
    [
      axios403({
        code: "STORE_SCOPE_REQUIRED",
        message: "Anda hanya dapat mengakses data di toko Anda"
      }),
      "noStore"
    ],
    [axios403({ code: "FOREIGN_STORE" }), "forbidden"],
    [{ response: { status: 500, data: {} } }, null],
    [new Error("Network Error"), null],
    [undefined, null]
  ])("%#", (error, expected) => {
    expect(forbiddenKind(error)).toBe(expected);
  });
});

describe("AbortController error view", () => {
  test("an account without a store sees why, with no retry button", () => {
    render(
      <AbortController
        refetch={jest.fn()}
        error={axios403({ message: "Store assignment required" })}
      />
    );
    expect(screen.getByText("error.noStoreTitle")).toBeInTheDocument();
    expect(screen.queryByText("error.internalServerError")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /common.tryAgain/ })).not.toBeInTheDocument();
  });

  test("other 403s read as access denied", () => {
    render(<AbortController refetch={jest.fn()} error={axios403({ code: "FOREIGN_STORE" })} />);
    expect(screen.getByText("error.forbiddenTitle")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /common.tryAgain/ })).not.toBeInTheDocument();
  });

  test("callers that pass no error keep the server-error view and retry", () => {
    render(<AbortController refetch={jest.fn()} />);
    expect(screen.getByText("error.internalServerError")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /common.tryAgain/ })).toBeInTheDocument();
  });
});
