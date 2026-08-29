import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseSalary(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") {
    return Number.isFinite(val) && val > 0 ? val : 0;
  }
  const direct = Number(val);
  if (Number.isFinite(direct)) {
    return direct > 0 ? direct : 0;
  }
  const cleaned = Number(String(val).replace(/[^0-9]/g, ""));
  return Number.isFinite(cleaned) && cleaned > 0 ? cleaned : 0;
}
