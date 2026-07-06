import { sanitizeInput } from "@/utils/inputSanitizer";

describe("Checkout Tests", () => {
  test("sanitize checkout payment inputs", () => {
    const maliciousCheckout = {
      customerPhone: '<script>alert("phishing")</script>+123456789',
      paymentMethod: "<img src=x onerror=alert(1)>",
      paymentAmount: "999; drop table transactions;--",
      notes: "test<span onclick=\"alert('xss')\">note</span>"
    };

    const sanitized = sanitizeInput(maliciousCheckout);
    expect(sanitized.customerPhone).toBe("+123456789");
    expect(sanitized.paymentMethod).toBe("");
    expect(sanitized.paymentAmount).toBe(999);
    expect(sanitized.notes).toBe("testnote");
  });

  test("customer points redemption validation", () => {
    const checkoutWithPoints = {
      customerPhone: "123456789",
      paymentMethod: "cash",
      redeemedPoints: "<script>10000000</script>",
      pointsToUse: '500<script>alert("hack")</script>'
    };

    const sanitized = sanitizeInput(checkoutWithPoints);
    expect(sanitized.customerPhone).toBe("123456789");
    expect(sanitized.redeemedPoints).toBe("");
    expect(sanitized.pointsToUse).toBe(500);
  });
});
