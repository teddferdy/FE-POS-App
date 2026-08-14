import { normalizePayload } from "@/lib/payload-normalizer";

export const buildSalaryExpensePayloads = ({ base, values, selectedSalaryEmps, salaryOf }) =>
  selectedSalaryEmps.map((emp) =>
    normalizePayload(
      {
        ...base,
        description: `Gaji ${emp.fullName || ""}`,
        amount: salaryOf(emp),
        payee: emp.fullName || "",
        employeeId: String(emp.id),
        categoryId: values.categoryId
      },
      { isFormData: false }
    )
  );

export const buildSingleExpensePayload = ({ base, values }) =>
  normalizePayload(
    {
      ...base,
      categoryId: values.categoryId,
      description: values.description,
      amount: values.amount,
      payee: values.payee || "",
      employeeId: values.employeeId || "",
      notes: values.notes || ""
    },
    { isFormData: false }
  );

export const createExpenses = ({ payloads, bulkCreate, singleCreate }) =>
  payloads.length > 1 ? bulkCreate(payloads) : singleCreate(payloads[0]);
