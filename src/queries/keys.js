// ponytail: satu sumber query key. Setiap parameter yang mengubah respons
// masuk ke key, jadi dua komponen dengan parameter sama otomatis berbagi satu
// request + cache, dan parameter berbeda tidak pernah saling menimpa cache.
// `all()` = root untuk invalidasi seluruh varian sekaligus.
export const qk = {
  locations: {
    all: () => ["location-options"],
    // "active" = default BE (status selain "all" → hanya toko aktif)
    list: (status = "active") => ["location-options", status === "all" ? "all" : "active"]
  }
};
