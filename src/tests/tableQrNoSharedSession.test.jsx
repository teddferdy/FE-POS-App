import { buildTableOrderUrl } from "../utils/tableOrderUrl";

// D-10 (DR-24): a diner sees only their own orders. The printed table QR
// used to carry one `session` shared by every diner who ever scanned that
// table; BISA now keys a diner by a token on their own device, so the QR
// carries only the table and store.

test("the table QR URL encodes table + store only — no shared diner session", () => {
  const url = new URL(buildTableOrderUrl("https://order.example", 7, "3"));
  expect(url.origin).toBe("https://order.example");
  expect(url.searchParams.get("table")).toBe("7");
  expect(url.searchParams.get("store")).toBe("3");
  expect(url.searchParams.get("source")).toBe("qr");
  expect(url.searchParams.has("session")).toBe(false);
});

test("ids are URL-encoded", () => {
  const url = new URL(buildTableOrderUrl("https://order.example", "a&b", "1"));
  expect(url.searchParams.get("table")).toBe("a&b");
});
