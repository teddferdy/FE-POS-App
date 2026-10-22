import { printViaBackend } from "@/utils/thermalPrint";
import { getToken } from "@/utils/cookies";

jest.mock("@/utils/cookies", () => ({ getToken: jest.fn() }));

describe("printViaBackend authentication", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test("sends the logged-in bearer token to /print-thermal", async () => {
    getToken.mockReturnValue("staff-token");
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, message: "Printed" })
    });
    globalThis.fetch = fetchMock;

    await printViaBackend({ items: [], total: 0 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5001/print-thermal",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer staff-token"
        })
      })
    );
  });

  test("omits Authorization when there is no token", async () => {
    getToken.mockReturnValue(null);
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, message: "Printed" })
    });
    globalThis.fetch = fetchMock;

    await printViaBackend({ items: [], total: 0 });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });
});
