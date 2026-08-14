import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseSalary(val) {
  if (val === null || val === undefined || val === "") return 0;
  const num = typeof val === "number" ? val : Number(String(val).replace(/[^0-9]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : 0;
}
