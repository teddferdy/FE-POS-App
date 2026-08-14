import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class-name inputs and resolves conflicting Tailwind CSS classes.
 * @param {...*} inputs - Class names or conditional class-name values.
 * @return {string} The merged class-name string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a salary value to a positive finite number.
 * @param {number|string|null|undefined} val - The salary value, optionally containing non-digit characters.
 * @return {number} The positive finite salary, or `0` for invalid or non-positive values.
 */
export function parseSalary(val) {
  if (val === null || val === undefined || val === "") return 0;
  const num = typeof val === "number" ? val : Number(String(val).replace(/[^0-9]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : 0;
}
