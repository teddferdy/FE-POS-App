// TDD RED: backend now emits machine-readable codes (PPN_MISSING,
// INVALID_STORE, INVALID_CHANNEL) on 400s. The classifier must distinguish
// PPN_MISSING from generic rejections without mislabelling unknown 400s.
import { classifyEffectiveTaxError, shouldRetryEffectiveTax } from "../utils/taxEffective.js";

const httpError = (status, data = {}) => ({ response: { status, data } });

describe("classifyEffectiveTaxError — backend code contract", () => {
  test("PPN_MISSING is classified distinctly as missing", () => {
    expect(
      classifyEffectiveTaxError(
        httpError(400, {
          success: false,
          code: "PPN_MISSING",
          message:
            "PPN tax configuration is missing for this outlet (store 3); configure an active PPN rate before selling"
        })
      )
    ).toBe("missing");
  });

  test("INVALID_STORE stays a generic rejection, never missing", () => {
    expect(
      classifyEffectiveTaxError(
        httpError(400, { success: false, code: "INVALID_STORE", message: "Invalid store value" })
      )
    ).toBe("rejected");
  });

  test("INVALID_CHANNEL stays a generic rejection, never missing", () => {
    expect(
      classifyEffectiveTaxError(
        httpError(400, {
          success: false,
          code: "INVALID_CHANNEL",
          message: "channel must be counter or qr"
        })
      )
    ).toBe("rejected");
  });

  test("unrelated 400s without a code stay generic rejections", () => {
    expect(classifyEffectiveTaxError(httpError(400, { message: "Invalid store value" }))).toBe(
      "rejected"
    );
    expect(classifyEffectiveTaxError(httpError(400, {}))).toBe("rejected");
    expect(
      classifyEffectiveTaxError(
        httpError(400, { code: "SOMETHING_NEW", message: "backend says so" })
      )
    ).toBe("rejected");
  });

  test("message alone never infers missing — only the code does", () => {
    expect(
      classifyEffectiveTaxError(
        httpError(400, {
          message:
            "PPN tax configuration is missing for this outlet (store 3); configure an active PPN rate before selling"
        })
      )
    ).toBe("rejected");
  });

  test("auth, availability, server and network behaviour is unchanged", () => {
    expect(classifyEffectiveTaxError(httpError(401))).toBe("unauthorized");
    expect(classifyEffectiveTaxError(httpError(403))).toBe("forbidden");
    expect(classifyEffectiveTaxError(httpError(404))).toBe("unavailable");
    expect(classifyEffectiveTaxError(httpError(422))).toBe("rejected");
    expect(classifyEffectiveTaxError(httpError(500))).toBe("failed");
    expect(classifyEffectiveTaxError(new Error("Network Error"))).toBe("failed");
  });

  test("missing never auto-retries, like other client errors", () => {
    const missing = httpError(400, { code: "PPN_MISSING", message: "missing" });
    expect(shouldRetryEffectiveTax(0, missing)).toBe(false);
    expect(shouldRetryEffectiveTax(0, httpError(400, { code: "INVALID_STORE" }))).toBe(false);
    expect(shouldRetryEffectiveTax(0, httpError(500))).toBe(true);
    expect(shouldRetryEffectiveTax(1, httpError(500))).toBe(false);
  });
});
