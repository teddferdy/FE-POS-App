/* global __dirname:readonly */
import fs from "fs";
import path from "path";

const read = (rel) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

describe("List auto-refresh conformance (masuk halaman fetch ulang + action refresh)", () => {
  test("QueryClient global refetch tiap mount (masuk/ganti halaman langsung fetch ulang)", () => {
    const src = read("index.jsx");
    expect(src).toMatch('refetchOnMount: "always"');
  });

  test("PriceStoreList edit harga meng-invalidate products-for-price", () => {
    const src = read("page/price-store/PriceStoreList.jsx");
    expect(src).toMatch('invalidateQueries(["products-for-price"])');
  });
});
