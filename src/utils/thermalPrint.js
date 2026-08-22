const RECEIPT_WIDTH = 48;

const padBoth = (left, right, width = RECEIPT_WIDTH) => {
  const leftLen = left.length;
  const rightLen = right.length;
  const space = Math.max(1, width - leftLen - rightLen);
  return left + " ".repeat(space) + right;
};

const line = (char = "-", width = RECEIPT_WIDTH) => char.repeat(width);

const formatPrice = (val) => `Rp${Number(val || 0).toLocaleString("id-ID")}`;

export const generateReceiptHTML = (data) => {
  const {
    storeName,
    storeAddress,
    storePhone,
    storeEmail,
    logo,
    memberName,
    memberTier,
    memberPoints,
    items = [],
    subtotal = 0,
    tax = 0,
    total = 0,
    footer,
    socialMedia = [],
    showLogo = true,
    showStoreName = true,
    showAddress = true,
    showMemberInfo = true,
    showSocialMedia = true,
    addressFieldsVisibility = {},
    socialMediaVisibility = {}
  } = data;

  const logoHtml =
    showLogo && logo
      ? `<div style="text-align:center;margin-bottom:8px"><img src="${logo}" style="max-width:40px;max-height:40px;border-radius:4px;background:#fff;padding:2px;margin:0 auto" /></div>`
      : "";

  const headerHtml = `
    <div style="background:#111;color:#fff;padding:10px 5px;text-align:center;">
      ${logoHtml}
      ${showStoreName && addressFieldsVisibility.storeName !== false ? `<div style="font-size:14px;font-weight:bold;text-transform:uppercase;">${storeName || "TOKO"}</div>` : ""}
      ${
        showAddress
          ? `
        <div style="font-size:10px;color:#ccc;margin-top:4px;">
          ${addressFieldsVisibility.address !== false && storeAddress ? `<div>${storeAddress}</div>` : ""}
          ${addressFieldsVisibility.phone !== false && storePhone ? `<div>Telp: ${storePhone}</div>` : ""}
          ${addressFieldsVisibility.email !== false && storeEmail ? `<div>${storeEmail}</div>` : ""}
        </div>
      `
          : ""
      }
    </div>
  `;

  const memberHtml =
    showMemberInfo && (memberName || memberTier)
      ? `
    <div style="background:#fffbeb;padding:8px;border-bottom:1px solid #fef3c7;font-size:10px;color:#78350f;">
      <div style="font-weight:bold;text-transform:uppercase;margin-bottom:4px;">INFO MEMBER</div>
      ${memberName ? `<div style="display:flex;justify-content:space-between;"><span>Nama:</span><span style="font-weight:bold;">${memberName}</span></div>` : ""}
      ${memberTier ? `<div style="display:flex;justify-content:space-between;"><span>Tier:</span><span style="font-weight:bold;">${memberTier}</span></div>` : ""}
      ${memberPoints !== undefined ? `<div style="display:flex;justify-content:space-between;"><span>Poin:</span><span style="font-weight:bold;">${Number(memberPoints).toLocaleString("id-ID")}</span></div>` : ""}
    </div>
  `
      : "";

  const itemsHtml = items
    .map(
      (item) => `
    <tr style="font-size:11px;">
      <td style="padding:4px 0;">${item.name}</td>
      <td style="padding:4px 0;text-align:center;">${item.qty}</td>
      <td style="padding:4px 0;text-align:right;">${formatPrice(item.price)}</td>
      <td style="padding:4px 0;text-align:right;font-weight:bold;">${formatPrice(item.qty * item.price)}</td>
    </tr>
  `
    )
    .join("");

  const footerHtml = `
    <div style="padding:10px 5px;border-top:1px solid #ddd;font-size:10px;text-align:center;color:#666;">
      <div style="font-style:italic;margin-bottom:8px;">${footer}</div>
      ${
        showSocialMedia && socialMedia.length > 0
          ? `
        <div style="display:flex;justify-content:center;gap:5px;flex-wrap:wrap;">
          ${socialMedia
            .filter((sm) => !socialMediaVisibility || socialMediaVisibility[sm.platform] !== false)
            .map((sm) => `<span>${sm.platform}: ${sm.account}</span>`)
            .join(" | ")}
        </div>
      `
          : ""
      }
    </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head><style>@page { width: 58mm; margin:0; } body { font-family: 'Courier New', Courier, monospace; }</style></head>
<body>
  <div style="width: 58mm; padding: 0 2px;">
    ${headerHtml}
    ${memberHtml}
    <table style="width:100%;border-collapse:collapse;margin:10px 0;">
      <tr style="font-size:10px;color:#666;text-transform:uppercase;border-bottom:1px solid #ddd;">
        <th style="text-align:left;padding:4px 0;">Item</th>
        <th style="text-align:center;padding:4px 0;">Qty</th>
        <th style="text-align:right;padding:4px 0;">Harga</th>
        <th style="text-align:right;padding:4px 0;">Total</th>
      </tr>
      ${itemsHtml}
    </table>
    <div style="padding:5px;background:#f9f9f9;font-size:11px;">
      <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>Pajak</span><span>${formatPrice(tax)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;margin-top:5px;font-size:13px;"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
    ${footerHtml}
  </div>
</body>
</html>
  `;
};

export const generateESCPOS = (data, opts = {}) => {
  const {
    storeName = "TOKO ANDA",
    storeAddress = "",
    storePhone = "",
    storeEmail = "",
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
    taxLabel = "Pajak (10%)",
    total = 0,
    paymentMethod = "Tunai",
    cashAmount = 0,
    changeAmount = 0,
    footer = "Terima kasih atas kunjungan Anda",
    socialMedia = [],
    showStoreName = true,
    showAddress = true,
    showMemberInfo = true,
    showSocialMedia = true
  } = data;

  const paymentLabel =
    String(paymentMethod || "Tunai")
      .charAt(0)
      .toUpperCase() + String(paymentMethod || "Tunai").slice(1);

  const W = RECEIPT_WIDTH;
  let enc = "";

  const init = "\x1B\x40";
  const alignCenter = "\x1B\x61\x01";
  const alignLeft = "\x1B\x61\x00";
  const doubleWidth = "\x1B\x21\x20";
  const normal = "\x1B\x21\x00";
  const boldOn = "\x1B\x45\x01";
  const boldOff = "\x1B\x45\x00";

  const dateObj = date ? new Date(date) : null;
  const validDate = dateObj && !isNaN(dateObj.getTime());
  const dateStr = validDate
    ? dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "-";
  const timeStr = validDate
    ? dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "-";

  enc += init;
  if (showStoreName && storeName) {
    enc += alignCenter + doubleWidth + boldOn;
    enc += storeName + "\n";
    enc += boldOff + normal;
  }

  enc += alignCenter;
  if (showAddress && storeAddress) enc += storeAddress + "\n";
  if (showAddress && storePhone) enc += "Telp: " + storePhone + "\n";
  if (showAddress && storeEmail) enc += storeEmail + "\n";

  enc += line("=", W) + "\n";
  enc += alignLeft;
  enc += padBoth(dateStr, timeStr) + "\n";
  enc += padBoth("Invoice: " + orderNumber, "Kasir: " + cashier) + "\n";
  if (showMemberInfo && memberName) {
    enc += "Member: " + memberName + "\n";
    if (memberTier) enc += "Tier: " + memberTier + "\n";
    if (memberPoints) enc += "Poin: " + Number(memberPoints).toLocaleString("id-ID") + "\n";
  }
  enc += line("=", W) + "\n";

  enc += padBoth("Item", "") + "\n";
  enc += "  " + "Qty".padEnd(3) + "  " + "Harga".padStart(15) + "  " + "Total".padStart(13) + "\n";
  enc += line("-", W) + "\n";

  items.forEach((item) => {
    const name = item.name || item.productName || "-";
    const qty = item.qty || item.quantity || 0;
    const price = item.price || 0;
    const itemTotal = item.total || item.subtotal || qty * price;
    const variant = item.options?.[0]?.name || item.variantName || "";

    enc += name + "\n";
    if (variant) enc += "  - " + variant + "\n";
    enc += "  " + String(qty).padEnd(3);
    enc += formatPrice(price).padStart(15);
    enc += "  " + formatPrice(itemTotal).padStart(13) + "\n";
  });

  enc += line("=", W) + "\n";
  enc += padBoth("Subtotal", formatPrice(subtotal)) + "\n";
  if (discount > 0) enc += padBoth("Diskon", "-" + formatPrice(discount)) + "\n";
  if (serviceCharge > 0) enc += padBoth("Biaya Layanan", formatPrice(serviceCharge)) + "\n";
  enc += padBoth(taxLabel, formatPrice(tax)) + "\n";
  enc += boldOn + line("=", W) + "\n";
  enc += padBoth("TOTAL", formatPrice(total)) + "\n";
  enc += boldOff + line("-", W) + "\n";
  enc += padBoth(paymentLabel, formatPrice(cashAmount)) + "\n";
  if (changeAmount > 0) enc += padBoth("Kembali", formatPrice(changeAmount)) + "\n";

  enc += line("=", W) + "\n";
  enc += alignCenter + footer + "\n";
  if (showSocialMedia && socialMedia.length > 0) {
    socialMedia.forEach((sm) => {
      enc += sm.platform + ": " + sm.account + "\n";
    });
  }
  enc += "\n\n\n";
  // ponytail: skip cut for mobile printers (no cutter), enable via opts.cut
  if (opts.cut) {
    enc += "\x1D\x56\x00";
  }

  return enc;
};

export const formatCurrency = (amount) => {
  return formatPrice(amount);
};

export const printViaBrowser = (data) => {
  const html = generateReceiptHTML(data);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
    return;
  }
  // ponytail: popup blocked — inject receipt overlay, print, remove
  const overlay = document.createElement("div");
  overlay.innerHTML = html;
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:99999;background:#fff;display:flex;align-items:center;justify-content:center";
  overlay.className = "print-thermal";
  const style = document.createElement("style");
  style.textContent = "@media print{body>*:not(.print-thermal){display:none!important}}";
  document.body.append(style, overlay);
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 100);
  }, 100);
};

export const printTestPage = () => {
  printViaBrowser({
    storeName: "TEST PRINTER",
    orderNumber: "TEST-001",
    cashier: "Admin",
    date: new Date().toISOString(),
    items: [{ name: "Test Print", qty: 1, price: 1000, total: 1000 }],
    subtotal: 1000,
    tax: 0,
    total: 1000,
    paymentMethod: "Test",
    footer: "Jika terbaca, printer OK"
  });
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
    const encoder = new TextEncoder();
    const bytes = encoder.encode(escpos);

    await device.transferOut(1, bytes);
    await device.close();
  } catch (error) {
    console.error("USB print error:", error);
    throw error;
  }
};

// ponytail: tries 9600 then 115200; X-58MP II sometimes needs 115200
const BAUD_RATES = [9600, 115200];

export const printViaSerial = async (data) => {
  try {
    let ports = await navigator.serial.getPorts();
    if (ports.length === 0) {
      const port = await navigator.serial.requestPort();
      ports = [port];
    }
    const port = ports[0];

    let lastError;
    for (const baud of BAUD_RATES) {
      try {
        await port.open({ baudRate: baud });
        lastError = null;
        break;
      } catch (e) {
        lastError = e;
      }
    }
    if (lastError) throw lastError;

    const writer = port.writable.getWriter();
    // ponytail: no cut for mobile printers
    const escpos = generateESCPOS(data);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(escpos);
    await writer.write(bytes);
    writer.releaseLock();
    await port.close();
  } catch (error) {
    console.error("Serial print error:", error);
    throw error;
  }
};

const BACKEND_PRINT_URL = "http://localhost:5001/print-thermal";

export const printViaBackend = async (data) => {
  const resp = await fetch(BACKEND_PRINT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data })
  });
  const result = await resp.json();
  if (!result.success) throw new Error(result.message);
};

export const detectPrintMethod = async () => {
  const methods = [];
  methods.push({ id: "backend", label: "Bluetooth (via Backend)", priority: 0 });
  if ("serial" in navigator) {
    try {
      const ports = await navigator.serial.getPorts();
      methods.push({
        id: "serial",
        label: "Serial (Bluetooth/USB)",
        priority: ports.length > 0 ? 1 : 2
      });
    } catch {
      methods.push({ id: "serial", label: "Serial (Bluetooth/USB)", priority: 2 });
    }
  }
  if ("usb" in navigator) {
    methods.push({ id: "webusb", label: "USB", priority: 3 });
  }
  methods.push({ id: "browser", label: "Browser Print", priority: 9 });
  methods.sort((a, b) => a.priority - b.priority);
  return methods;
};

export const printReceipt = async (data, method = "auto") => {
  if (method === "auto") {
    const methods = await detectPrintMethod();
    const errors = [];
    for (const m of methods) {
      if (m.id === "browser") {
        printViaBrowser(data);
        return;
      }
      try {
        await printReceipt(data, m.id);
        return;
      } catch (e) {
        errors.push(`${m.id}: ${e.message}`);
      }
    }
    throw new Error("All print methods failed:\n" + errors.join("\n"));
  }

  switch (method) {
    case "backend":
      return printViaBackend(data);
    case "webusb":
      return printViaWebUSB(data);
    case "serial":
      return printViaSerial(data);
    case "browser":
    default:
      printViaBrowser(data);
      return;
  }
};
