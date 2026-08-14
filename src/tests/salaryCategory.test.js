import { isSalaryCategoryName } from "@/lib/salary-category";

describe("isSalaryCategoryName", () => {
  test.each([
    "Gaji",
    "gaji",
    "GAJI",
    "Gaji Karyawan",
    "Salary",
    "salary",
    "Salary & Benefits",
    "Upah",
    "upah lembur",
    "Wage",
    "gaji bulanan",
    "honor salary"
  ])("detects '%s' as a salary category", (name) => {
    expect(isSalaryCategoryName(name)).toBe(true);
  });

  test.each([
    "Bahan Baku",
    "Operasional",
    "Utilitas",
    "Transport",
    "Marketing",
    "",
    null,
    undefined
  ])("does not detect '%s' as a salary category", (name) => {
    expect(isSalaryCategoryName(name)).toBe(false);
  });
});
