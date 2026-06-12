/* eslint-disable no-undef */
const RECEIPT_WIDTH = 48;

const padBoth = (left, right, width = RECEIPT_WIDTH) => {
  const leftLen = left.length;
  const rightLen = right.length;
  const space = Math.max(1, width - leftLen - rightLen);
  return left + " ".repeat(space) + right;
};

const line = (char = "-", width = RECEIPT_WIDTH) => char.repeat(width);

const cut = () => "\x1B\x69";

export const generateReceiptHTML = (data) => {
  const {
    storeName = "TOKO ANDA",
    storeAddress = "",
    storePhone = "",
    memberName = "",
    memberTier = "",
    memberPoints = 0,
    orderNumber = "",
    cashier = "",
    customer = "Umum",
    date = new Date().toLocaleString("id-ID"),
    items = [],
    subtotal = 0,
    discount = 0,
    tax = 0,
    total = 0,
    paymentMethod = "Tunai",
    cashAmount = 0,
    changeAmount = 0,
    footer = "Terima kasih atas kunjungan Anda"
  } = data;

  const logoHtml = logo
    ? `<div style="text-align:center;margin-bottom:6px"><img src="${logo}" style="max-height:60px;object-fit:contain" /></div>`
    : "";

  const itemsHtml = items
    .map(
      (item, i) => `
    <tr>
      <td style="font-size:12px;font-family:monospace">${i + 1}. ${item.name || item.productName || "-"}</td>
    </tr>
    <tr>
      <td style="font-size:12px;font-family:monospace;padding-left:16px">
        ${item.qty || item.quantity || 0} x ${formatCurrency(item.price || 0)}
        <span style="float:right">${formatCurrency(item.total || item.subtotal || 0)}</span>
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><title>Print Receipt</title></head>
<body>
  <div id="receipt" style="width:80mm;padding:4px 8px;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.3">
    <div style="text-align:center;margin-bottom:8px">
      ${logoHtml}
      <div style="font-size:16px;font-weight:bold">${storeName}</div>
      ${storeAddress ? `<div style="font-size:11px">${storeAddress}</div>` : ""}
      ${storePhone ? `<div style="font-size:11px">Telp: ${storePhone}</div>` : ""}
    </div>
    <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 0;margin:4px 0;font-size:11px">
      <div>No: ${orderNumber}</div>
      <div>Kasir: ${cashier}</div>
      <div>Pelanggan: ${customer}</div>
      <div>${date}</div>
    </div>
    ${
      memberName
        ? `
    <div style="border-bottom:1px dashed #000;padding:4px 0;margin:4px 0;font-size:11px">
      <div>Member: ${memberName}${memberTier ? ` (${memberTier})` : ""}</div>
      ${memberPoints ? `<div>Poin: ${Number(memberPoints).toLocaleString("id-ID")}</div>` : ""}
    </div>`
        : ""
    }
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="border-bottom:1px solid #000">
          <th style="text-align:left">Item</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="border-top:1px dashed #000;margin-top:4px;padding-top:4px;font-size:12px">
      <div style="display:flex;justify-content:space-between">
        <span>Subtotal</span><span>${formatCurrency(subtotal)}</span>
      </div>
      ${discount > 0 ? `<div style="display:flex;justify-content:space-between"><span>Diskon</span><span>-${formatCurrency(discount)}</span></div>` : ""}
      ${tax > 0 ? `<div style="display:flex;justify-content:space-between"><span>Pajak</span><span>${formatCurrency(tax)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;border-top:1px solid #000;padding-top:4px;margin-top:4px">
        <span>TOTAL</span><span>${formatCurrency(total)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px">
        <span>${paymentMethod}</span><span>${formatCurrency(cashAmount)}</span>
      </div>
      ${changeAmount > 0 ? `<div style="display:flex;justify-content:space-between"><span>Kembali</span><span>${formatCurrency(changeAmount)}</span></div>` : ""}
    </div>
    <div style="text-align:center;margin-top:12px;font-size:11px">${footer}</div>
  </div>
  <script>
    window.onload = function() { window.print(); window.close(); }
  </script>
</body>
</html>`;
};

export const generateESCPOS = (data) => {
  const {
    storeName = "TOKO ANDA",
    storeAddress = "",
    storePhone = "",
    memberName = "",
    memberTier = "",
    memberPoints = 0,
    orderNumber = "",
    cashier = "",
    customer = "Umum",
    date = new Date().toLocaleString("id-ID"),
    items = [],
    subtotal = 0,
    discount = 0,
    tax = 0,
    total = 0,
    paymentMethod = "Tunai",
    cashAmount = 0,
    changeAmount = 0,
    footer = "Terima kasih atas kunjungan Anda"
  } = data;

  const W = RECEIPT_WIDTH;
  let enc = "";

  const init = "\x1B\x40";
  const alignCenter = "\x1B\x61\x01";
  const alignLeft = "\x1B\x61\x00";
  const alignRight = "\x1B\x61\x02";
  const doubleWidth = "\x1B\x21\x20";
  const normal = "\x1B\x21\x00";
  const boldOn = "\x1B\x45\x01";
  const boldOff = "\x1B\x45\x00";

  enc += init;
  enc += alignCenter + doubleWidth + boldOn;
  enc += storeName + "\n";
  enc += boldOff + normal;

  enc += alignCenter;
  if (storeAddress) enc += storeAddress + "\n";
  if (storePhone) enc += "Telp: " + storePhone + "\n";

  enc += line("=", W) + "\n";
  enc += alignLeft;
  enc += padBoth("No: " + orderNumber, date) + "\n";
  enc += "Kasir: " + cashier + "\n";
  enc += "Pelanggan: " + customer + "\n";
  if (memberName) {
    enc += "Member: " + memberName;
    if (memberTier) enc += " (" + memberTier + ")";
    enc += "\n";
    if (memberPoints) enc += "Poin: " + Number(memberPoints).toLocaleString("id-ID") + "\n";
  }
  enc += line("-", W) + "\n";

  items.forEach((item) => {
    const name = item.name || item.productName || "-";
    const qty = item.qty || item.quantity || 0;
    const price = item.price || 0;
    const itemTotal = item.total || item.subtotal || qty * price;

    enc += name + "\n";
    enc += "  " + qty + " x " + formatCurrency(price);
    enc += alignRight + formatCurrency(itemTotal) + "\n";
    enc += alignLeft;
  });

  enc += line("-", W) + "\n";
  enc += padBoth("Subtotal", formatCurrency(subtotal)) + "\n";
  if (discount > 0) enc += padBoth("Diskon", "-" + formatCurrency(discount)) + "\n";
  if (tax > 0) enc += padBoth("Pajak", formatCurrency(tax)) + "\n";
  enc += boldOn + line("=", W) + "\n";
  enc += padBoth("TOTAL", formatCurrency(total)) + "\n";
  enc += boldOff + line("-", W) + "\n";
  enc += padBoth(paymentMethod, formatCurrency(cashAmount)) + "\n";
  if (changeAmount > 0) enc += padBoth("Kembali", formatCurrency(changeAmount)) + "\n";

  enc += line("=", W) + "\n";
  enc += alignCenter + footer + "\n";
  enc += "\n\n\n";
  enc += cut();

  return enc;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const printViaBrowser = (data) => {
  const html = generateReceiptHTML(data);
  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
    return;
  }
  win.document.write(html);
  win.document.close();
};

export const printViaWebUSB = async (data) => {
  try {
    const device = await navigator.usb.requestDevice({
      filters: []
    });
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);

    const escpos = generateESCPOS(data);
    const encoder = new TextEncoder("ascii");
    const bytes = encoder.encode(escpos);

    await device.transferOut(1, bytes);
    await device.close();
  } catch (error) {
    console.error("USB print error:", error);
    throw error;
  }
};

export const printViaSerial = async (data) => {
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    const writer = port.writable.getWriter();
    const escpos = generateESCPOS(data);
    const encoder = new TextEncoder("ascii");
    const bytes = encoder.encode(escpos);
    await writer.write(bytes);
    writer.releaseLock();
    await port.close();
  } catch (error) {
    console.error("Serial print error:", error);
    throw error;
  }
};

export const printReceipt = (data, method = "browser") => {
  switch (method) {
    case "webusb":
      return printViaWebUSB(data);
    case "serial":
      return printViaSerial(data);
    case "browser":
    default:
      printViaBrowser(data);
      return Promise.resolve();
  }
};
