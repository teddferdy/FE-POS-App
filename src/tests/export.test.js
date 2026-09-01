import { exportReport } from "../services/export";

const mockGet = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: { get: (...args) => mockGet(...args) }
}));

globalThis.URL.createObjectURL = jest.fn(() => "blob:test");
globalThis.URL.revokeObjectURL = jest.fn();

describe("exportReport", () => {
  beforeEach(() => {
    mockGet.mockReset();
    globalThis.URL.createObjectURL.mockClear();
    globalThis.URL.revokeObjectURL.mockClear();
    document.body.innerHTML = "";
  });

  test("calls the export endpoint with format and params", async () => {
    mockGet.mockResolvedValue({ status: 200, data: new ArrayBuffer(8) });
    await exportReport("daily", { format: "csv", params: { startDate: "2026-09-01" } });
    expect(mockGet).toHaveBeenCalledWith("/report/export/daily?format=csv&startDate=2026-09-01", {
      responseType: "arraybuffer"
    });
  });

  test("triggers a download link", async () => {
    mockGet.mockResolvedValue({
      status: 200,
      data: new ArrayBuffer(8),
      headers: { "content-disposition": 'attachment; filename="laporan-harian.csv"' }
    });
    const linkCtorSpy = jest.spyOn(document, "createElement");
    await exportReport("daily", { format: "csv", params: {} });
    expect(document.createElement).toHaveBeenCalledWith("a");
    linkCtorSpy.mockRestore();
  });
});
