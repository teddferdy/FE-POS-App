const RECEIPT_WIDTH = 48;

const padBoth = (left, right, width = RECEIPT_WIDTH) => {
  const leftLen = left.length;
  const rightLen = right.length;
  const space = Math.max(1, width - leftLen - rightLen);
  return left + " ".repeat(space) + right;
};

const line = (char = "-", width = RECEIPT_WIDTH) => char.repeat(width);

const cut = () => "\x1B\x69";

const formatPrice = (val) => `Rp${Number(val || 0).toLocaleString("id-ID")}`;

export const generateReceiptHTML = (data) => {
  const {
    storeName = "TOKO ANDA",
    storeAddress = "",
    storePhone = "",
    logo = "",
    memberName = "",
    memberTier = "",
    memberPoints = 0,
    orderNumber = "",
    cashier = "",
    date = new Date().toLocaleString("id-ID"),
    items = [],
    subtotal = 0,
    discount = 0,
    serviceCharge = 0,
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

  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const timeStr = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="font-size:12px;font-family:monospace;border-bottom:1px dashed #ccc;padding:2px 0">${item.name || item.productName || "-"}</td>
      <td style="font-size:12px;font-family:monospace;text-align:center;border-bottom:1px dashed #ccc;padding:2px 0;width:30px">${item.qty || item.quantity || 0}</td>
      <td style="font-size:12px;font-family:monospace;text-align:right;border-bottom:1px dashed #ccc;padding:2px 0;width:80px">${formatPrice(item.price || 0)}</td>
      <td style="font-size:12px;font-family:monospace;text-align:right;border-bottom:1px dashed #ccc;padding:2px 0;width:80px;font-weight:500">${formatPrice(item.total || item.subtotal || 0)}</td>
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
      <div style="font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px">${storeName}</div>
      ${storeAddress ? `<div style="font-size:11px;color:#555">${storeAddress}</div>` : ""}
      ${storePhone ? `<div style="font-size:11px;color:#555">Telp: ${storePhone}</div>` : ""}
    </div>
    <div style="border-top:2px solid #000;border-bottom:1px dashed #000;padding:4px 0;margin:4px 0;font-size:11px">
      <div style="display:flex;justify-content:space-between">
        <span>${dateStr}</span>
        <span>${timeStr}</span>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span>Invoice: ${orderNumber}</span>
        <span>Kasir: ${cashier}</span>
      </div>
    </div>
    ${
      memberName
        ? `
    <div style="border-bottom:1px dashed #000;padding:4px 0;margin:4px 0;font-size:11px">
      <div style="font-weight:500">${memberName}</div>
      ${memberTier ? `<div style="color:#555;font-size:10px">Tier: ${memberTier}</div>` : ""}
      ${memberPoints ? `<div style="color:#555;font-size:10px">Poin: ${Number(memberPoints).toLocaleString("id-ID")}</div>` : ""}
    </div>`
        : ""
    }
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="border-bottom:2px solid #000">
          <th style="text-align:left;font-size:10px;text-transform:uppercase;padding:2px 0">Item</th>
          <th style="text-align:center;font-size:10px;text-transform:uppercase;padding:2px 0;width:30px">Qty</th>
          <th style="text-align:right;font-size:10px;text-transform:uppercase;padding:2px 0;width:80px">Harga</th>
          <th style="text-align:right;font-size:10px;text-transform:uppercase;padding:2px 0;width:80px">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="border-top:2px solid #000;margin-top:4px;padding-top:4px;font-size:12px">
      <div style="display:flex;justify-content:space-between">
        <span>Subtotal</span><span>${formatPrice(subtotal)}</span>
      </div>
      ${discount > 0 ? `<div style="display:flex;justify-content:space-between"><span>Diskon</span><span style="color:#c00">-${formatPrice(discount)}</span></div>` : ""}
      ${serviceCharge > 0 ? `<div style="display:flex;justify-content:space-between"><span>Biaya Layanan</span><span>${formatPrice(serviceCharge)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between">
        <span>Pajak (10%)</span><span>${formatPrice(tax)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;border-top:2px solid #000;padding-top:4px;margin-top:4px">
        <span>TOTAL</span><span>${formatPrice(total)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px">
        <span>${paymentMethod}</span><span>${formatPrice(cashAmount)}</span>
      </div>
      ${changeAmount > 0 ? `<div style="display:flex;justify-content:space-between"><span>Kembali</span><span>${formatPrice(changeAmount)}</span></div>` : ""}
    </div>
    <div style="text-align:center;margin-top:12px;font-size:11px;font-style:italic;color:#666">${footer}</div>
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
  const doubleWidth = "\x1B\x21\x20";
  const normal = "\x1B\x21\x00";
  const boldOn = "\x1B\x45\x01";
  const boldOff = "\x1B\x45\x00";

  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const timeStr = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  enc += init;
  enc += alignCenter + doubleWidth + boldOn;
  enc += storeName + "\n";
  enc += boldOff + normal;

  enc += alignCenter;
  if (storeAddress) enc += storeAddress + "\n";
  if (storePhone) enc += "Telp: " + storePhone + "\n";

  enc += line("=", W) + "\n";
  enc += alignLeft;
  enc += padBoth(dateStr, timeStr) + "\n";
  enc += padBoth("Invoice: " + orderNumber, "Kasir: " + cashier) + "\n";
  if (memberName) {
    enc += "Member: " + memberName + "\n";
    if (memberTier) enc += "Tier: " + memberTier + "\n";
    if (memberPoints) enc += "Poin: " + Number(memberPoints).toLocaleString("id-ID") + "\n";
  }
  enc += line("=", W) + "\n";

  // Table header
  enc += padBoth("Item", "") + "\n";
  enc += "  " + "Qty".padEnd(3) + "  " + "Harga".padStart(15) + "  " + "Total".padStart(13) + "\n";
  enc += line("-", W) + "\n";

  items.forEach((item) => {
    const name = item.name || item.productName || "-";
    const qty = item.qty || item.quantity || 0;
    const price = item.price || 0;
    const itemTotal = item.total || item.subtotal || qty * price;

    enc += name + "\n";
    enc += "  " + String(qty).padEnd(3);
    enc += formatPrice(price).padStart(15);
    enc += "  " + formatPrice(itemTotal).padStart(13) + "\n";
  });

  enc += line("=", W) + "\n";
  enc += padBoth("Subtotal", formatPrice(subtotal)) + "\n";
  if (discount > 0) enc += padBoth("Diskon", "-" + formatPrice(discount)) + "\n";
  enc += padBoth("Pajak (10%)", formatPrice(tax)) + "\n";
  enc += boldOn + line("=", W) + "\n";
  enc += padBoth("TOTAL", formatPrice(total)) + "\n";
  enc += boldOff + line("-", W) + "\n";
  enc += padBoth(paymentMethod, formatPrice(cashAmount)) + "\n";
  if (changeAmount > 0) enc += padBoth("Kembali", formatPrice(changeAmount)) + "\n";

  enc += line("=", W) + "\n";
  enc += alignCenter + footer + "\n";
  enc += "\n\n\n";
  enc += cut();

  return enc;
};

export const formatCurrency = (amount) => {
  return formatPrice(amount);
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
