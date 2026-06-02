# Flowchart FE ↔ BE — POS System

## Legend

```
[FE Page] → service function() → 🔵 GET /api/...
[FE Page] → service function() → 🟢 POST /api/...
[FE Page] → service function() → 🟡 PUT /api/...
[FE Page] → service function() → 🔴 DELETE /api/...
[FE Page] → service function() → 🟣 PATCH /api/...

──► chain/dependency flow
~~► optional chain
```

---

## 1. MASTER DATA (Produk, Kategori, Supplier)

```mermaid
flowchart TD
    A["/category-list"] --> B["getAllCategoryTable()"]
    B --> BE1["🔵 GET /category/get-category-all?store=&page=&limit=&statusCategory="]
    A --> BE2["🔴 DELETE /category/delete-category/{id}"]
    A --> BE3["🟢 POST /category/download-template"]
    A --> BE4["🟢 POST /category/download-excel"]

    C["/add-category"] --> D["addCategory()"]
    D --> BE5["🟢 POST /category/add-new-category"]

    E["/edit-category"] --> F["getCategoryById()"]
    F --> BE6["🔵 GET /category/get-category-by-id/{id}"]
    E --> G["editCategory()"]
    G --> BE7["🟡 PUT /category/edit-category/{id}"]

    H["/sub-category-list"] --> I["getAllSubCategory()"]
    I --> BE8["🔵 GET /sub-category/get-all-sub-category?store="]
    H --> BE9["🔴 DELETE /sub-category/delete-subcategory/{id}"]

    J["/add-sub-category"] --> K["addSubCategory()"]
    K --> BE10["🟢 POST /sub-category/add-subcategory"]

    L["/edit-sub-category"] --> M["editSubCategory()"]
    M --> BE11["🟡 PUT /sub-category/edit-subcategory/{id}"]

    N["/product-list"] --> O["getAllProduct()"]
    O --> BE12["🔵 GET /product?store=&page=&limit=&search=&category=&status="]

    P["/add-product"] --> Q["addProduct()"]
    Q --> BE13["🟢 POST /product/add-new-product"]
    P --> R["getAllCategoryTable()"]
    R --> BE1
    P --> S["getAllTaxConfig()"]
    S --> BE14["🔵 GET /tax-config?store=&page=&limit=&search="]

    T["/edit-product"] --> U["getProductById()"]
    U --> BE15["🔵 GET /product/{id}"]
    T --> V["editProduct()"]
    V --> BE16["🟡 PUT /product/{id}"]

    W["/supplier"] --> X["getAllSupplier()"]
    X --> BE17["🔵 GET /supplier?location=&page=&limit=&search="]
    W --> BE18["🔴 DELETE /supplier/{id}"]

    Y["/add-supplier"] --> Z["addSupplier()"]
    Z --> BE19["🟢 POST /supplier/add-new-supplier"]

    AA["/edit-supplier"] --> AB["editSupplier()"]
    AB --> BE20["🟡 PUT /supplier/{id}"]
```

### Field Mapping Kritis — Add Product

```json
{
  "name": "string*",
  "sku": "string (auto-hint SKU-{timestamp})",
  "productType": "'simple' | 'service'",
  "idCategory": "number*",
  "purchasePrice": "number",
  "description": "string",
  "isActive": "boolean",
  "options": "[{ name, price, stock }]", // <-- per variant: string[] → object[]
  "taxes": "[{ id: number }]",
  "images": "File[]"
}
```

---

## 2. MASTER DATA (Pajak, Price Template, Diskon, Tipe Bayar, Shift)

```mermaid
flowchart TD
    A["/tax-list"] --> B["getAllTaxConfig()"]
    B --> BE1["🔵 GET /tax-config?store=&page=&limit=&search="]
    A --> BE2["🔴 DELETE /tax-config/{id}"]

    C["/add-tax"] --> D["addTaxConfig()"]
    D --> BE3["🟢 POST /tax-config/add-new-tax"]

    E["/price-list-template"] --> F["getAllPriceListTemplate()"]
    F --> BE4["🔵 GET /price-list-template?store=&page=&limit="]

    G["/discount-list"] --> H["getAllDiscount()"]
    H --> BE5["🔵 GET /discount/get-discount?store=&page=&limit=&status="]
    G --> BE6["🔴 DELETE /discount/delete-discount/{id}"]

    I["/add-discount"] --> J["addDiscount()"]
    J --> BE7["🟢 POST /discount/add-new-discount"]

    K["/type-payment-list"] --> L["getAllTypePaymentListActive()"]
    L --> BE8["🔵 GET /type-payment/get-type-payment?store=&page=&limit=&status="]
    K --> BE9["🔴 DELETE /type-payment/delete-type-payment/{id}"]

    M["/add-type-payment"] --> N["addTypePayment()"]
    N --> BE10["🟢 POST /type-payment/add-new-type-payment"]

    O["/shift-list"] --> P["getAllShift()"]
    P --> BE11["🔵 GET /shift/get-shift?store=&page=&limit=&status="]
    O --> BE12["🔴 DELETE /shift/delete-shift/{id}"]

    Q["/add-shift"] --> R["addShift()"]
    R --> BE13["🟢 POST /shift/add-new-shift"]
```

### Field Mapping — Discount

```json
{
  "name": "string*",
  "type": "'Persentase' | 'Nominal'*",
  "value": "number*",
  "startDate": "date*",
  "endDate": "date",
  "minPurchase": "number",
  "description": "string",
  "isActive": "boolean"
}
```

### Field Mapping — Type Payment

```json
{
  "name": "string*",
  "type": "'Tunai' | 'Non-Tunai' | 'Transfer'*",
  "description": "string",
  "isActive": "boolean"
}
```

### Field Mapping — Shift

```json
{
  "name": "string*",
  "startTime": "HH:mm*",
  "endTime": "HH:mm*",
  "description": "string",
  "isActive": "boolean"
}
```

---

## 3. MEMBER, TIER, EMPLOYEE, POSITION, DEPARTMENT

```mermaid
flowchart TD
    A["/member-list"] --> B["getAllMember()"]
    B --> BE1["🔵 GET /member?store=&page=&limit=&search="]

    C["/add-member"] --> D["addMember()"]
    D --> BE2["🟢 POST /member/add-new-member"]

    E["/member-detail"] --> F["getMemberById()"]
    F --> BE3["🔵 GET /member/{id}"]

    G["/member-tier"] --> H["getAllMemberTier()"]
    H --> BE4["🔵 GET /member-tier?store=&page=&limit="]

    I["/employee-list"] --> J["getAllEmployee()"]
    J --> BE5["🔵 GET /employee?store=&page=&limit=&search="]

    K["/add-employee"] --> L["addEmployee()"]
    L --> BE6["🟢 POST /employee/add-new-employee"]

    M["/position-list"] --> N["getAllPosition()"]
    N --> BE7["🔵 GET /position?store=&page=&limit="]

    O["/department-list"] --> P["getAllDepartment()"]
    P --> BE8["🔵 GET /department?store=&page=&limit="]
```

---

## 4. LOKASI (Store / Outlet)

```mermaid
flowchart TD
    A["/location-list"] --> B["getAllLocation()"]
    B --> BE1["🔵 GET /location/get-location?store=&page=&limit="]
    A --> BE2["🔴 DELETE /location/delete-location/{id}"]

    C["/add-location"] --> D["addLocation()"]
    D --> BE3["🟢 POST /location/add-new-location"]

    E["/edit-location"] --> F["editLocation()"]
    F --> BE4["🟡 PUT /location/edit-location/{id}"]

    G["/store-geospatial"] --> H["getStoreGeospatial()"]
    H --> BE5["🔵 GET /location/geospatial?store="]
```

---

## 5. STOCK OVERSIGHT (Opname, History, Low Stock)

```mermaid
flowchart TD
    A["/stock-opname"] --> B["getStockOpname()"]
    B --> BE1["🔵 GET /stock-opname/get-all?store=&page=&limit=&status="]

    C["/add-stock-opname"] --> D["addStockOpname()"]
    D --> BE2["🟢 POST /stock-opname/create"]
    C --> E["getAllProduct()"]
    E --> BE3["🔵 GET /product?store=&page=&limit="]

    F["/stock-opname/detail"] --> G["getStockOpnameById()"]
    G --> BE4["🔵 GET /stock-opname/get-by-id/{id}"]

    H["/stock-history"] --> I["getAllStockHistory()"]
    I --> BE5["🔵 GET /stock-history/get-all?page=&limit=&product=&referenceType=&startDate=&endDate="]

    J["/low-stock"] --> K["getLowStockProducts()"]
    K --> BE6["🔵 GET /stock-history/low-stock"]
```

### Stock Chain — Critical Path

```mermaid
flowchart LR
    PO["🟢 Purchase Order\nReceive"] --> STOCK["+ Stock qty"]
    OPNAME["Stock Opname\nAdjust"] --> STOCK
    SALE["POS Checkout\nCreate Order"] --> STOCK["- Stock qty"]
    RETUR_PO["Retur Beli 🆕"] --> STOCK["- Stock qty"]
    RETUR_SALE["Retur Jual 🆕"] --> STOCK["+ Stock qty"]
    TRANSFER["Transfer 🆕"] --> STOCK_A["- Stock Toko A"]
    TRANSFER --> STOCK_B["+ Stock Toko B"]
    ADJUST["Adjustment 🆕"] --> STOCK["± Stock qty"]
```

> **⚠️ Catatan BE:** Semua perubahan stok harus nulis ke `stock-history` table dengan `referenceType` yang sesuai (`purchase_receive`, `sale`, `opname_adjust`, `purchase_return`, `sale_return`, `transfer`, `adjustment`).

---

## 6. PURCHASE ORDER & TABLE

```mermaid
flowchart TD
    A["/purchase-order"] --> B["getAllPurchaseOrder()"]
    B --> BE1["🔵 GET /purchase-order?store=&page=&limit="]
    A --> BE2["🟢 POST /purchase-order/{id}/receive"]

    C["/add-purchase-order"] --> D["addPurchaseOrder()"]
    D --> BE3["🟢 POST /purchase-order"]
    C --> E["getAllSupplier()"]
    E --> BE4["🔵 GET /supplier?location=&page=&limit="]
    C --> F["getAllProduct()"]
    F --> BE5["🔵 GET /product?store=&page=&limit="]

    G["/table-list"] --> H["getTablesByStore()"]
    H --> BE6["🔵 GET /table/get-table?store="]
    G --> I["addTable()"]
    I --> BE7["🟢 POST /table/add-new-table"]
    G --> J["editTable()"]
    J --> BE8["🟡 PUT /table/edit-table/{id}"]
    G --> K["deleteTable()"]
    K --> BE9["🔴 DELETE /table/delete-table/{id}"]
    G --> L["updateTableStatus()"]
    L --> BE10["🟡 PUT /table/edit-status/{id}"]
    G --> M["getTableAvailability()"]
    M --> BE11["🔵 GET /table/availability?store="]
```

### Field Mapping — Purchase Order

```json
{
  "store": "number*",
  "supplier": "number*",
  "notes": "string",
  "items": "[{ product, qty, price }]*"
}
// Response expected:
{
  "data": [{
    "id": 1,
    "store": 1,
    "supplier": { id, name },
    "notes": "...",
    "status": "open | received | cancelled",
    "items": [{ product: { id, name }, qty, price }],
    "createdAt": "ISO8601"
  }],
  "pagination": { total, totalPages }
}
```

### Field Mapping — Table

```json
{
  "name": "string*",
  "capacity": "number*",
  "status": "'available' | 'occupied' | 'reserved'*",
  "store": "number*"
}
```

---

## 7. EXPENSE (Biaya + Kategori)

```mermaid
flowchart TD
    A["/expense-category"] --> B["getExpenseCategories()"]
    B --> BE1["🔵 GET /expense-category"]
    A --> BE2["🔴 DELETE /expense-category/{id}"]

    C["/add-expense-category"] --> D["addExpenseCategory()"]
    D --> BE3["🟢 POST /expense-category"]

    E["/expense"] --> F["getAllExpenses()"]
    F --> BE4["🔵 GET /expense?store=&page=&limit="]
    E --> G["approveExpense()"]
    G --> BE5["🟢 POST /expense/{id}/approve"]

    H["/add-expense"] --> I["addExpense()"]
    I --> BE6["🟢 POST /expense"]
    H --> J["getExpenseCategories()"]
    J --> BE1
```

### Field Mapping — Expense

```json
{
  "categoryId": "number*",
  "description": "string*",
  "amount": "number*",
  "date": "date*",
  "notes": "string",
  "store": "number"
}
// Response expected:
{
  "data": [{
    "id": 1,
    "category": { id, name },
    "description": "...",
    "amount": 50000,
    "date": "ISO8601",
    "status": "pending | approved",
    "store": 1
  }],
  "pagination": { total, totalPages }
}
```

---

## 8. POS FLOW — CORE TRANSACTION (BELUM ADA FE PAGE)

```mermaid
flowchart LR
    subgraph PRE_FLIGHT
        CR["Cash Register\nOpen Shift"] --> BE_CR["🟢 POST /cash-register/open"]
        BE_CR --> CR_OK["res: { id, openingBalance, openedAt }"]
    end

    subgraph ORDER
        CART["Cart\n(State order-list.js)"] --> ADD["addItem()"]
        ADD --> ADD_DISCOUNT["applyDiscount()"]
        ADD_DISCOUNT --> BE_DISC["🟢 POST /order/apply-discount/{id}"]
        CART --> CHECKOUT["🟢 POST /order/create-order"]
        CHECKOUT --> BE_ORDER["📦 body: { store, items[], memberId, discountId, tableId, notes }"]
        BE_ORDER --> ORDER_OK["res: { id, invoice, total, items[] }"]
    end

    subgraph PAYMENT
        ORDER_OK --> PAY["🧾 Payment Modal"]
        PAY --> BE_PAY["🟢 POST /checkout/checkout-item"]
        BE_PAY --> PAY_OK["res: { paymentMethod, amount, change }"]
    end

    subgraph POST_PAYMENT
        PAY_OK --> INVOICE["🧾 Invoice Config"]
        INVOICE --> BE_INV_GET["🔵 GET /invoice/get-invoice-logo-by-active?store="]
        INVOICE --> BE_INV_SOCIAL["🔵 GET /invoice/get-invoice-social-media-by-location?store="]
        INVOICE --> BE_INV_FOOTER["🔵 GET /invoice/get-invoice-footer-by-location?store="]
        PAY_OK --> CR_CLOSE["🟢 POST /cash-register/{id}/close"]
    end

    subgraph VOID_RETURN
        CANCEL["🟡 PUT /order/update-status/{id}"] --> BE_CANCEL["📦 body: { status: cancelled }"]
        RETUR["🟢 POST /order/{id}/return 🆕"] --> BE_RETUR["📦 body: { items: [{ productId, qty, reason }] }"]
    end

    PRE_FLIGHT --> ORDER
    ORDER --> PAYMENT
    PAYMENT --> POST_PAYMENT
    PAYMENT --> VOID_RETURN
```

### Critical Chain CREATE ORDER → DEDUCT STOCK → UPDATE HISTORY

```mermaid
flowchart TD
    A["Checkout Click"] --> B["POST /checkout/checkout-item"]
    B --> C{"BE Validasi"}
    C -->|Stock Cukup| D["Deduct Stock\n(atomic DB operation)"]
    C -->|Stock Kurang| E["Return error\nitem: { name, available }"]
    D --> F["Write Stock History\nreferenceType='sale'"]
    F --> G["Generate Invoice\n(fetch config: logo, footer, sosial)"]
    G --> H["Return success\n{ invoice, total, change, items[] }"]
    H --> I["FE: Print Receipt\n(react-to-print)"]
    H --> J["FE: Update Cart State\n(reset)"]

    style D fill:#ff6b6b
    style F fill:#ff6b6b
```

> **⚠️ Catatan BE:** `POST /checkout/checkout-item` harus atomic:
>
> 1. Validasi stok semua item
> 2. Kurangi stok (per variant option jika ada)
> 3. Tulis stock history dengan `referenceType='sale'`
> 4. Generate invoice number
> 5. Return response lengkap

---

## 9. INVOICE CONFIG (Logo, Footer, Sosial Media) — SERVICE EXISTS

```mermaid
flowchart TD
    A["/logo-invoice-list"] --> B["getAllInvoiceLogo()"]
    B --> BE1["🔵 GET /invoice/get-invoice-logo?store=&page=&limit=&status="]

    C["/add-invoice-logo"] --> D["addInvoiceLogo()"]
    D --> BE2["🟢 POST /invoice/add-new-invoice-logo"]

    E["/footer-invoice-list"] --> F["getAllInvoiceFooter()"]
    F --> BE3["🔵 GET /invoice/get-invoice-footer?store="]

    G["/social-media-invoice-list"] --> H["getAllInvoiceSocialMedia()"]
    H --> BE4["🔵 GET /invoice/get-invoice-social-media?store="]

    I["Location-based\n(POS receipt)"] --> J["getInvoiceLogoByLocation()"]
    J --> BE5["🔵 GET /invoice/get-invoice-logo-by-location?store="]
    I --> K["getInvoiceSocialMediaByLocation()"]
    K --> BE6["🔵 GET /invoice/get-invoice-social-media-by-location?store="]
    I --> L["getInvoiceFooterByLocation()"]
    L --> BE7["🔵 GET /invoice/get-invoice-footer-by-location?store="]
```

---

## 10. FULL SYSTEM CHAIN — ALL FEATURES

```mermaid
flowchart TD
    subgraph MASTER["MASTER DATA"]
        P["/product-list\n/product/add/edit"] --> CAT["/category-list\n/category/add/edit"]
        P --> SC["/sub-category-list"]
        P --> SUP["/supplier\n/add/edit"]
        P --> TAX["/tax-list\n/add/edit"]
        subgraph VARIANTS["Variant Options"]
            V1["options: [{ name, price, stock }]"]
        end
        P --> LOC["/location-list\n/add/edit"]
        EMP["/employee-list\n/add/edit"] --> POS["/position-list"]
        EMP --> DEP["/department-list"]
        MEM["/member-list\n/add"] --> TIER["/member-tier"]
    end

    subgraph TRANSACTION["TRANSACTION"]
        PO["/purchase-order\n/add"] --> PO_RCV["Receive → +Stock"]
        TABLE["/table-list"]
        CASHIER["🧑‍💻 POS CASHIER\n(BELUM DIBUAT)"] --> ORDER["Create Order"]
        ORDER --> PAY["Payment"]
        ORDER --> DISC["/discount-list"]
        ORDER --> TPAY["/type-payment-list"]
        PAY --> STOCK["- Stock"]
    end

    subgraph OPERATIONAL["OPERATIONAL"]
        OPNAME["/stock-opname\n/add"]
        HIST["/stock-history"]
        LOW["/low-stock"]
        EXP["/expense\n/add"]
        EXPCAT["/expense-category"]
        SHIFT["/shift-list\n/add"]
        CR["Cash Register\nOpen/Close"]
        SETTING["/global-setting"]
    end

    subgraph REPORT["REPORT"]
        SALES["/report/sales"]
        BEST["/best-selling"]
        DASH["/dashboard-super-admin\n/dashboard-admin"]
    end

    subgraph NEW["🆕 YANG PERLU BE"]
        TRANSFER["Stock Transfer"]
        ADJUST["Stock Adjustment"]
        RETUR_PO["Retur Pembelian"]
        RETUR_SALE["Retur Penjualan"]
        BARCODE["Barcode Lookup"]
        POINTS["Loyalty Points"]
        BATCH["Batch/Expiry"]
    end

    MASTER --> TRANSACTION
    TRANSACTION --> OPERATIONAL
    TRANSACTION --> REPORT
    TRANSACTION -.-> NEW
```

---

## 11. RESPONSE STRUCTURE WAJARAN — STANDARD YANG DIHARAPKAN FE

Semua service FE mengharapkan response dengan struktur berikut:

### GET (List)

```json
{
  "data": [{ ...objects }],
  "pagination": {
    "total": 100,
    "totalPages": 10,
    "page": 1,
    "limit": 10
  },
  "stats": {
    "total": 100,
    "active": 80,
    "inactive": 20
  }
}
```

### GET (Detail / By ID)

```json
{
  "data": { ...singleObject }
}
```

### POST / PUT

```json
{
  "data": { ...createdOrUpdatedObject },
  "message": "Success"
}
```

### DELETE

- Status: `200`, `201`, atau `204`
- Body: `{ "message": "Deleted" }` (optional)

---

## 12. CRITICAL NOTES — YANG PERLU DICOBAKAN SAMA BE

| #   | Issue                                                                                             | Dampak                                                        |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | **Express default return 201** → FE service sudah fix terima 201/204                              | ✅ No action needed                                           |
| 2   | **Category endpoint** → `/category/get-category-all` (with `-all`) bukan `/category/get-category` | BE harus sediain endpoint ini                                 |
| 3   | **Product variant options** → FE kirim `[{ name, price, stock }]` bukan `["Large"]`               | BE harus parse sesuai                                         |
| 4   | **Purchase Order** → FE kirim `{ store, supplier, notes, items: [{ product, qty, price }] }`      | BE harus terima format ini                                    |
| 5   | **Stock opname items** → FE kirim `{ productId, ... }`                                            | BE perlu siapin kolom `productId` di tabel stock_opname_items |
| 6   | **Stock history referenceType** → FE filter pakai `referenceType` untuk categorisasi              | BE harus isi field ini                                        |
| 7   | **Product fields** → FE kirim `sku`, `productType`, `options`                                     | BE harus siapin kolom ini                                     |
| 8   | **Expense category** → `GET /expense-category` tanpa parameter                                    | Tidak ada filter store → bisa campur aduk                     |
| 9   | **Sub category** → `GET /sub-category/get-all-sub-category?store=`                                | Tidak ada pagination di FE — perlu ditambah?                  |
| 10  | **Discount/TipePayment/Shift** → Tidak ada `getById` endpoint                                     | FE filter client-side, tapi idealnya BE sediain get-by-id     |

---

> **Dibuat:** $(date +%d/%m/%Y) — Bisa-Nota POS System
