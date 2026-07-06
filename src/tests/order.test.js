import { sanitizeInput } from "@/utils/inputSanitizer";

describe("Order Creation Tests", () => {
  test("sanitize order inputs prevents malicious payloads", () => {
    const maliciousOrder = {
      items: [
        {
          productId: '<script>alert("xss")</script>',
          quantity: "<script>100</script>",
          price: "999; drop table users;--"
        }
      ],
      customerName: "Robert');<script>alert(1)</script>",
      totalPrice: "1000<script>alert(2)</script>"
    };

    const sanitized = sanitizeInput(maliciousOrder);
    expect(sanitized.items[0].productId).toBe("");
    expect(sanitized.items[0].quantity).toBe("");
    expect(sanitized.items[0].price).toBe(999);
    expect(sanitized.customerName).toBe("Robert");
  });

  test("high value order triggers validation", () => {
    const highValueOrder = {
      items: [
        {
          productId: "123",
          quantity: 1000,
          price: 999999
        }
      ],
      customerName: "John Doe",
      totalPrice: 999999000
    };

    const sanitized = sanitizeInput(highValueOrder);
    expect(sanitized.items[0].productId).toBe("123");
    expect(sanitized.items[0].quantity).toBe(1000);
    expect(sanitized.items[0].price).toBe(999999);
  });
});
