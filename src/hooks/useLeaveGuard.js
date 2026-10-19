import { useNavigate } from "react-router-dom";
import { useUnsavedChanges } from "./useUnsavedChanges";

const isEqual = (a, b) => {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => Object.prototype.hasOwnProperty.call(b, k) && isEqual(a[k], b[k]));
};

// ponytail: dibaca saat klik, bukan dari snapshot render — formState.isDirty
// baru ter-update setelah validasi async resolver (zod) selesai, jadi klik
// cepat setelah mengetik bisa terbaca "bersih" dan membuang input.
const hasChanges = (form) =>
  form.formState.isDirty || !isEqual(form.getValues(), form.formState.defaultValues ?? {});

// ponytail: keluar dari form — langsung ke `to` bila belum ada perubahan,
// minta konfirmasi (`confirm`) bila sudah. Sekaligus memasang prompt
// beforeunload browser selama form dirty. Hanya untuk form yang SEMUA
// inputnya di react-hook-form; state di useState tidak ikut terhitung.
export function useLeaveGuard(form, to, confirm) {
  const navigate = useNavigate();
  useUnsavedChanges(form.formState.isDirty);
  return () => (hasChanges(form) ? confirm() : navigate(to));
}
