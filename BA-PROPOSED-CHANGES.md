# BA Proposed Changes — POS System

> **Status:** Draft — Need BA Validation  
> **Date:** 07 June 2026  
> **Author:** Dev Team  

---

## ✅ Completed Milestone (Sprint 1)

| Task | Status | Files Changed |
|------|--------|---------------|
| Hapus `preparationTime` (FE + BE) | ✅ Done | AddProduct, EditProduct, DetailProduct, i18n EN/ID, BE product model + controller |
| Hapus `priceListTemplate` (FE + BE) | ✅ Done | 4 FE pages deleted, sidebar, routes, services, i18n, BE model/controller/routes/migration |
| Fix seed user: `user1`/`user2` → `kasir_utama`/`staff_gudang` | ✅ Done | seeder file updated |

---

## 🚧 Proposed Changes — Need BA Validation

---

### 1. Konfigurasi PPN 11%

**Issue:** Perhitungan PPN sekarang sudah 11% (sesuai UU HPP).

**Proposed Solution:**
- Update default tarif PPN di form produk atau sistem config
- Pastikan kalkulasi PPN di checkout menggunakan 11%

**Scope:**
- [ ] FE: Update label/placeholder di form produk (jika hardcoded)
- [ ] BE: Update default rate di controller atau config

**Effort:** ⏱ 30 menit

---

### 2. Service Charge

**Issue:** Tidak ada perhitungan service charge (penting untuk F&B).

**Proposed Schema:**

#### Field Baru di Tabel `transaction`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `service_charge_persen` | DECIMAL(5,2) | `0.00` | Persentase service charge (e.g. 5%, 10%) |
| `service_charge_nominal` | DECIMAL(15,2) | `0.00` | Hasil kalkulasi: subtotal × service_charge_persen / 100 |
| `service_charge_otomatis` | BOOLEAN | `true` | Apakah service charge otomatis diterapkan |

#### Perhitungan
```
subtotal = Σ(harga_item × qty)
service_charge_nominal = subtotal × service_charge_persen / 100
pajak_nominal = (subtotal + service_charge_nominal) × pajak_persen / 100
grand_total = subtotal + service_charge_nominal + pajak_nominal - diskon
```

#### FE Changes
- [ ] Checkout modal: Tampilkan toggle/service charge input
- [ ] Receipt: Tampilkan line item "Service Charge"
- [ ] Settings page (opsional): Config default service charge per toko

**Effort:** ⏱ 1-2 hari

---

### 3. Field Transaksi Baru

**Issue:** Field transaksi saat ini tidak cukup untuk F&B.

#### Tabel: `transaction` — Tambah Kolom

| # | Field | Type | Constraint | Default | Description |
|---|-------|------|------------|---------|-------------|
| 1 | `no_meja` | VARCHAR(20) | NULLABLE | `null` | Nomor meja untuk F&B |
| 2 | `id_shift` | INTEGER | FK → `shift(id)` | `null` | Shift saat transaksi terjadi |
| 3 | `total_covers` | INTEGER | NULLABLE | `null` | Jumlah tamu/orang (F&B) |
| 4 | `service_charge` | DECIMAL(15,2) | NOT NULL | `0.00` | Service charge nominal |
| 5 | `service_charge_persen` | DECIMAL(5,2) | NOT NULL | `0.00` | Persentase service charge |
| 6 | `pajak_nominal` | DECIMAL(15,2) | NOT NULL | `0.00` | PPN nominal terhitung |
| 7 | `pajak_persen` | DECIMAL(5,2) | NOT NULL | `11.00` | Persentase PPN yang dipakai |
| 8 | `total_diskon_transaksi` | DECIMAL(15,2) | NOT NULL | `0.00` | Diskon level transaksi |
| 9 | `status_bayar_lunas` | VARCHAR(20) | NOT NULL | `'lunas'` | `'lunas'` / `'hutang'` / `'cicil'` |

#### BE Changes
- [ ] Migration: `ALTER TABLE transaction ADD COLUMN ...`
- [ ] Model: Update `transaction.js` definition
- [ ] Controller: Update `createTransaction` / `updateTransaction` untuk handle field baru

#### FE Changes
- [ ] Checkout modal: Tambah input `no_meja`, `total_covers`, `id_shift` (dropdown)
- [ ] Checkout modal: Update kalkulasi total (subtotal + service_charge + pajak - diskon)
- [ ] Receipt: Tampilkan field baru di struk
- [ ] Transaction list: Tampilkan filter by shift, meja
- [ ] Transaction detail: Tampilkan semua field baru

**Effort:** ⏱ 2-3 hari

---

### 4. Field Transaksi Item Baru

**Issue:** Item transaksi tidak mendukung status dapur dan modifier.

#### Tabel: `transaction_item` — Tambah Kolom

| # | Field | Type | Constraint | Default | Description |
|---|-------|------|------------|---------|-------------|
| 1 | `status_masak` | VARCHAR(20) | NOT NULL | `'pending'` | `'pending'` / `'dimasak'` / `'siap'` / `'tersaji'` / `'void'` |
| 2 | `id_station_dapur` | INTEGER | FK → `station(id)` | `null` | Station dapur tujuan |
| 3 | `catatan_item` | TEXT | NULLABLE | `null` | Catatan khusus / request |
| 4 | `waktu_order` | DATETIME | NOT NULL | `NOW()` | Waktu order masuk |
| 5 | `waktu_siap` | DATETIME | NULLABLE | `null` | Waktu selesai dimasak |
| 6 | `urutan_saji` | INTEGER | NOT NULL | `0` | Urutan penyajian |
| 7 | `hpp_snapshot` | DECIMAL(15,2) | NULLABLE | `null` | HPP saat transaksi (snapshot) |
| 8 | `id_modifier_dipilih` | JSONB | NULLABLE | `[]` | Array modifier yg dipilih beserta harga |

#### BE Changes
- [ ] Migration: `ALTER TABLE transaction_item ADD COLUMN ...`
- [ ] Model: Update `transaction_item.js`
- [ ] Controller: Update create/update item
- [ ] New: Station dapur model + controller + routes (opsional)

#### FE Changes
- [ ] Checkout: Tambah input `catatan_item` per produk
- [ ] Checkout: Modifier selector per item
- [ ] New: Dapur Display page (opsional — untuk lihat pesanan + update status masak)
- [ ] Receipt: Tampilkan modifier + catatan

**Effort:** ⏱ 3-5 hari (termasuk dapur display)

---

### 5. Laporan Harian (Daily Report)

**Issue:** Belum ada laporan harian terstruktur untuk F&B.

#### Tabel Baru: `daily_report`

| # | Field | Type | Description |
|---|-------|------|-------------|
| 1 | `id` | INTEGER PK | Auto-increment |
| 2 | `id_toko` | INTEGER FK | FK → `store(id)` |
| 3 | `tanggal` | DATE | Tanggal laporan |
| 4 | `sesi` | VARCHAR(20) | `'pagi'` / `'siang'` / `'malam'` |
| 5 | `total_transaksi` | INTEGER | Jumlah transaksi |
| 6 | `total_penjualan_bersih` | DECIMAL(15,2) | Revenue setelah diskon |
| 7 | `total_hpp` | DECIMAL(15,2) | Total HPP |
| 8 | `food_cost_persen` | DECIMAL(5,2) | (total_hpp / revenue) × 100 |
| 9 | `gross_profit` | DECIMAL(15,2) | revenue - hpp |
| 10 | `gross_margin_persen` | DECIMAL(5,2) | (gross_profit / revenue) × 100 |
| 11 | `total_biaya_operasional` | DECIMAL(15,2) | Dari expense |
| 12 | `net_profit` | DECIMAL(15,2) | gross_profit - biaya ops |
| 13 | `net_margin_persen` | DECIMAL(5,2) | (net_profit / revenue) × 100 |
| 14 | `total_covers` | INTEGER | Total tamu |
| 15 | `avg_spending_per_cover` | DECIMAL(15,2) | revenue / covers |
| 16 | `total_item_void` | INTEGER | Jumlah item void |
| 17 | `total_nilai_void` | DECIMAL(15,2) | Nilai void |
| 18 | `penjualan_tunai` | DECIMAL(15,2) | |
| 19 | `penjualan_qris` | DECIMAL(15,2) | |
| 20 | `penjualan_transfer` | DECIMAL(15,2) | |
| 21 | `saldo_kas_awal` | DECIMAL(15,2) | |
| 22 | `saldo_kas_akhir_sistem` | DECIMAL(15,2) | |
| 23 | `saldo_kas_akhir_fisik` | DECIMAL(15,2) | |
| 24 | `selisih_kas` | DECIMAL(15,2) | fisik - sistem |
| 25 | `status_food_cost` | VARCHAR(20) | `'baik'` / `'waspada'` / `'buruk'` |
| 26 | `created_at` | DATETIME | |
| 27 | `updated_at` | DATETIME | |

#### FE Changes
- [ ] Halaman baru: Daily Report dengan filter tanggal
- [ ] Kartu/tabel statistik: total transaksi, revenue, food cost, profit
- [ ] Grafik tren
- [ ] Export PDF / Excel
- [ ] Sidebar menu: Tambah menu "Laporan Harian"

#### Effort: ⏱ 1-2 minggu

---

### 6. Laporan L/R & Cash Flow

**Issue:** Tidak ada laporan Laba/Rugi dan Arus Kas.

#### Laporan Laba/Rugi (Profit & Loss)

```
PENDAPATAN
  Total Penjualan Bersih          xxx
  Diskon Transaksi               (xxx)
  -----------------------------
  NET REVENUE                     xxx

HARGA POKOK PENJUALAN
  Total HPP                      (xxx)
  -----------------------------
  GROSS PROFIT                    xxx
  Gross Margin                    xx%

BIAYA OPERASIONAL
  Gaji Karyawan                  (xxx)
  Sewa                           (xxx)
  Utilities                      (xxx)
  Lain-lain                      (xxx)
  -----------------------------
  TOTAL BIAYA OPS                (xxx)

LABA BERSIH                      xxx
Net Margin                       xx%
```

#### Laporan Arus Kas (Cash Flow)

```
KAS MASUK
  Penjualan Tunai                xxx
  Penjualan QRIS                 xxx
  Penjualan Transfer             xxx
  Piutang Masuk                  xxx
  -----------------------------
  TOTAL KAS MASUK                 xxx

KAS KELUAR
  Purchase Order                 (xxx)
  Gaji Karyawan                  (xxx)
  Biaya Operasional              (xxx)
  Hutang Dibayar                 (xxx)
  -----------------------------
  TOTAL KAS KELUAR               (xxx)

SELISIH KAS                      xxx
SALDO KAS AWAL                   xxx
SALDO KAS AKHIR                  xxx
```

#### Tidak Perlu Tabel Baru
- Cukup query aggregation dari transaksi, expense, purchase_order
- Gunakan materialized view atau query langsung

#### FE Changes
- [ ] 2 halaman report baru: L/R dan Cash Flow
- [ ] Filter periode (bulanan, kuartalan, tahunan)
- [ ] Grafik tren
- [ ] Export PDF / Excel

#### Effort: ⏱ 1-2 minggu

---

### 7. Produk — Field Baru

**Issue:** Tidak ada perbedaan produk menu dengan produk bahan baku.

#### Tabel: `product` — Tambah Kolom

| # | Field | Type | Default | Description |
|---|-------|------|---------|-------------|
| 1 | `tipe_produk` | VARCHAR(20) | `'menu'` | `'menu'` / `'bahan_baku'` — membedakan produk jual vs bahan |
| 2 | `hpp_per_porsi` | DECIMAL(15,2) | `0.00` | Harga pokok per porsi (manual atau auto dari bahan) |
| 3 | `food_cost_persen` | DECIMAL(5,2) | `0.00` | (hpp / harga_jual) × 100 — auto calculate |
| 4 | `margin_persen` | DECIMAL(5,2) | `0.00` | Margin keuntungan |
| 5 | `is_available_hari_ini` | BOOLEAN | `true` | Ketersediaan harian (toggle di kasir) |
| 6 | `stok_bahan_cukup` | BOOLEAN | `true` | Auto-check jika stok bahan cukup |

#### FE Changes
- [ ] Form produk: Tambah `tipe_produk` selector
- [ ] Form produk: Jika "bahan baku", sembunyikan field yang tidak relevan (harga jual, dll)
- [ ] Form produk: Tampilkan `food_cost_persen` auto-calculate
- [ ] Kasir: Tampilkan `is_available_hari_ini` toggle
- [ ] Produk list: Filter by tipe

#### Effort: ⏱ 3-5 hari

---

## Prioritas Rekomendasi

### Sprint 2 (1-2 hari)
| # | Item | Alasan |
|---|------|--------|
| 1 | PPN 11% | Peraturan berlaku, quick win |
| 2 | Service Charge | F&B critical, moderate effort |

### Sprint 3 (3-5 hari)
| # | Item | Alasan |
|---|------|--------|
| 3 | Field Transaksi | Enabler untuk fitur F&B lainnya |
| 4 | Field Produk | Membutuhkan field transaksi sebagai dependency |

### Sprint 4 (1-2 minggu)
| # | Item | Alasan |
|---|------|--------|
| 5 | Field Transaksi Item | Dependensi ke field transaksi |
| 6 | Laporan Harian | Membutuhkan field transaksi baru |

### Sprint 5 (1-2 minggu)
| # | Item | Alasan |
|---|------|--------|
| 7 | Laporan L/R & Cash Flow | Paling kompleks, butuh semua data lain stabil |

---

## Notes for BA

1. **Service Charge rate** → Apakah per-toko atau global? Perlu config/store settings?
2. **Station Dapur** → Perlu tabel master sendiri atau cukup enum?
3. **Laporan Harian sesi** → Apakah "pagi/siang/malam" fix atau custom?
4. **Tipe Produk** → Untuk MVP, cukup `menu`/`bahan_baku` atau perlu lebih?
5. **Purchase Order** → Dari catatan BA "PO tidak ada" — di codebase sudah ada folder `purchase-order` di FE. Perlu dicek apakah BE sudah support atau belum.
6. **Trend Pendapatan Kosong** → Issue existing di laporan Produk Terlaris. Data tidak muncul karena mungkin query missing join atau data transaksi belum ada.
7. **History Stok Kategori "Penyesuaian"** → Saat tambah produk baru, masuk kategori "Penyesuaian" bukan "Baru Masuk". Perlu update logika pencatatan history stok.

---

*Document generated for BA review. All estimates are preliminary.*
