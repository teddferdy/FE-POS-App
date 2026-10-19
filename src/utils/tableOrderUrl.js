// URL printed in a table's QR code. D-10 (DR-24): it carries only the table
// and store — never a diner session. A session printed here was shared by
// every diner who ever scanned that table; BISA now keys each diner by a
// token on their own device.
export const buildTableOrderUrl = (baseUrl, tableId, storeId) =>
  `${baseUrl}/?table=${encodeURIComponent(tableId)}&store=${encodeURIComponent(storeId)}&source=qr`;
