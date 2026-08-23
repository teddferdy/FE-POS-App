// ponytail: dipakai thermalPrint & TableQRModal — semua data yang masuk
// template HTML struk/cetak wajib lewat sini sebelum disisipkan
export const escapeHtml = (val) =>
  String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
