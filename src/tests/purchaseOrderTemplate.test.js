import { downloadPurchaseOrderTemplate } from "../services/purchase-order";

const mockGet = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: { get: (...args) => mockGet(...args) }
}));

globalThis.URL.createObjectURL = jest.fn(() => "blob:test");
globalThis.URL.revokeObjectURL = jest.fn();

describe("downloadPurchaseOrderTemplate", () => {
  beforeEach(() => {
    mockGet.mockReset();
    globalThis.URL.createObjectURL.mockClear();
    globalThis.URL.revokeObjectURL.mockClear();
    document.body.innerHTML = "";
  });

  test("requests the purchase-order template as arraybuffer", async () => {
    mockGet.mockResolvedValue({ status: 200, data: new ArrayBuffer(8) });
    await downloadPurchaseOrderTemplate();
    expect(mockGet).toHaveBeenCalledWith("/purchase-order/template", {
      responseType: "arraybuffer"
    });
  });

  test("triggers a download link", async () => {
    mockGet.mockResolvedValue({ status: 200, data: new ArrayBuffer(8) });
    const createElementSpy = jest.spyOn(document, "createElement");
    await downloadPurchaseOrderTemplate();
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });
});
