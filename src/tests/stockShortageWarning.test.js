import { toast } from "sonner";
import { describeStockShortages, warnStockShortages } from "../lib/stock-shortage";

jest.mock("sonner", () => ({ toast: { warning: jest.fn() } }));

// BA gap 028 (DR-18): the settlement response's stockShortages are shown.
describe("stock shortage warning", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lists each short item with its shortfall", () => {
    expect(
      describeStockShortages([
        { name: "Bakso Halus", shortfall: 3 },
        { name: "Bakso Urat", shortfall: 1 }
      ])
    ).toBe("Bakso Halus (−3), Bakso Urat (−1)");
  });

  test("warns only when there is a shortage", () => {
    const t = (k, o) => (o ? `${k}:${o.items}` : k);
    expect(warnStockShortages(undefined, t)).toBe(false);
    expect(warnStockShortages([], t)).toBe(false);
    expect(toast.warning).not.toHaveBeenCalled();
    expect(warnStockShortages([{ name: "Bakso Telur", shortfall: 2 }], t)).toBe(true);
    expect(toast.warning).toHaveBeenCalledWith("page.cashier.stockShortage.title", {
      description: "page.cashier.stockShortage.desc:Bakso Telur (−2)",
      duration: 10000
    });
  });
});
