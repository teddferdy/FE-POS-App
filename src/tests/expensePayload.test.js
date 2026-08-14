import {
  buildSalaryExpensePayloads,
  buildSingleExpensePayload,
  createExpenses
} from "@/lib/expense-payload";

describe("buildSalaryExpensePayloads", () => {
  const base = {
    store: 3,
    date: "2026-08-14",
    status: "pending",
    frequency: "monthly",
    paymentMethod: "cash",
    recurringEndDate: ""
  };
  const values = { categoryId: "7" };

  test("creates one separate expense record per selected employee", () => {
    const salaryOf = (emp) => (emp.id === 1 ? 5000000 : 4000000);
    const payloads = buildSalaryExpensePayloads({
      base,
      values,
      selectedSalaryEmps: [
        { id: 1, fullName: "Budi" },
        { id: 2, fullName: "Siti" }
      ],
      salaryOf
    });

    expect(payloads).toHaveLength(2);
    expect(payloads[0]).toMatchObject({
      store: 3,
      categoryId: "7",
      description: "Gaji Budi",
      amount: 5000000,
      payee: "Budi",
      employeeId: "1",
      status: "pending",
      frequency: "monthly",
      paymentMethod: "cash"
    });
    expect(payloads[1]).toMatchObject({
      description: "Gaji Siti",
      amount: 4000000,
      payee: "Siti",
      employeeId: "2"
    });
    expect(payloads[0].employeeId).not.toBe(payloads[1].employeeId);
  });

  test("returns an empty array when no employees are selected", () => {
    const payloads = buildSalaryExpensePayloads({
      base,
      values,
      selectedSalaryEmps: [],
      salaryOf: () => 0
    });
    expect(payloads).toEqual([]);
  });

  test("drops empty or null fields from the payload", () => {
    const payloads = buildSalaryExpensePayloads({
      base: {
        store: null,
        date: "",
        status: "pending",
        frequency: "once",
        paymentMethod: "cash",
        recurringEndDate: ""
      },
      values: { categoryId: "7" },
      selectedSalaryEmps: [{ id: 1, fullName: "Budi" }],
      salaryOf: () => 1000000
    });
    const p = payloads[0];
    expect(p.store).toBeUndefined();
    expect(p.date).toBeUndefined();
    expect(p.recurringEndDate).toBeUndefined();
    expect(p.employeeId).toBe("1");
  });
});

describe("buildSingleExpensePayload", () => {
  test("builds a normal (non-salary) expense payload", () => {
    const payload = buildSingleExpensePayload({
      base: {
        store: 2,
        date: "2026-08-14",
        status: "pending",
        frequency: "once",
        paymentMethod: "cash",
        recurringEndDate: ""
      },
      values: {
        categoryId: "3",
        description: "Sewa tempat",
        amount: 1500000,
        payee: "Owner",
        employeeId: "",
        notes: "catatan"
      }
    });

    expect(payload).toMatchObject({
      store: 2,
      categoryId: "3",
      description: "Sewa tempat",
      amount: 1500000,
      payee: "Owner",
      notes: "catatan",
      status: "pending",
      frequency: "once"
    });
    expect(payload.employeeId).toBeUndefined();
    expect(payload.recurringEndDate).toBeUndefined();
  });
});

describe("createExpenses (atomic bulk creation decision)", () => {
  test("uses a single bulk request when creating multiple expenses", async () => {
    const bulkCreate = jest.fn().mockResolvedValue({ data: [] });
    const singleCreate = jest.fn();
    const payloads = [{ employeeId: "1" }, { employeeId: "2" }];

    await createExpenses({ payloads, bulkCreate, singleCreate });

    expect(bulkCreate).toHaveBeenCalledTimes(1);
    expect(bulkCreate).toHaveBeenCalledWith(payloads);
    expect(singleCreate).not.toHaveBeenCalled();
  });

  test("a failed attempt does not create duplicates on retry (single request re-issued per attempt)", async () => {
    const bulkCreate = jest.fn();
    bulkCreate.mockRejectedValueOnce(new Error("network"));
    const payloads = [{ employeeId: "1" }, { employeeId: "2" }];

    await expect(createExpenses({ payloads, bulkCreate })).rejects.toThrow("network");

    bulkCreate.mockResolvedValueOnce({ data: [{ id: 11 }, { id: 12 }] });
    const result = await createExpenses({ payloads, bulkCreate });

    expect(bulkCreate).toHaveBeenCalledTimes(2);
    expect(bulkCreate.mock.calls[0][0]).toHaveLength(2);
    expect(bulkCreate.mock.calls[1][0]).toHaveLength(2);
    expect(result).toEqual({ data: [{ id: 11 }, { id: 12 }] });
  });

  test("uses the single-create endpoint for a single expense", async () => {
    const bulkCreate = jest.fn();
    const singleCreate = jest.fn().mockResolvedValue({ data: { id: 1 } });

    const result = await createExpenses({
      payloads: [{ categoryId: "3" }],
      bulkCreate,
      singleCreate
    });

    expect(singleCreate).toHaveBeenCalledTimes(1);
    expect(singleCreate).toHaveBeenCalledWith({ categoryId: "3" });
    expect(bulkCreate).not.toHaveBeenCalled();
    expect(result).toEqual({ data: { id: 1 } });
  });
});
