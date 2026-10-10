// T3: single source for the admin tax-type badge label. The persisted
// `type` field is authoritative; the historical name-prefix heuristic
// applies only when the type is `other`, missing, or unrecognized, so
// legacy rows (e.g. seeded "PPh 23 2%" with type `other`) keep their
// established display. Pure module — no imports, safe to unit-test.
export const getTaxType = (name, type) => {
  if (type === "ppn") return "PPN";
  if (type === "service_charge") return "Non-Pajak";
  if (!name) return "Non-Pajak";
  if (name.startsWith("PPN")) return "PPN";
  if (name.startsWith("PPh")) return "PPh";
  return "Non-Pajak";
};
