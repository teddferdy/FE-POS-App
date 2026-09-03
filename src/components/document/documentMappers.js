export const getDocumentSpecForGoodsRequest = (d, t) => {
  const statusKey = `goodsRequest.status.${d.status || "pending"}`;
  return {
    title: t("document.suratPermintaanBarang"),
    number: d.requestNumber,
    meta: [
      { label: t("page.goodsRequest.detail.store"), value: d.storeData?.name },
      { label: t("page.goodsRequest.detail.requestedBy"), value: d.requestedBy },
      { label: t("document.date"), value: d.createdAt },
      { label: t("document.status"), value: t(statusKey) }
    ],
    columns: [
      { key: "item", label: t("document.item") },
      { key: "qty", label: t("document.qty"), align: "right" },
      { key: "unit", label: t("document.unit"), align: "center" }
    ],
    rows: (d.items || []).map((it) => ({
      item: it.ingredientName || it.productName || "-",
      qty: it.qty,
      unit: it.unit || "-"
    })),
    totals: [],
    signature: {
      preparedBy: d.requestedBy,
      knownBy: d.createdByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};

export const getDocumentSpecForGoodsReceipt = (d, t) => {
  const statusKey = `goodsReceipt.status.${d.status || "draft"}`;
  return {
    title: t("document.suratPenerimaanBarang"),
    number: d.receiptNumber,
    meta: [
      { label: t("page.goodsReceipt.detail.store"), value: d.storeData?.name },
      { label: t("document.reference"), value: d.purchaseOrderData?.orderNumber },
      { label: t("document.receivedDate"), value: d.receivedDate },
      { label: t("document.position"), value: d.picData?.fullName },
      { label: t("document.status"), value: t(statusKey) }
    ],
    columns: [
      { key: "item", label: t("document.item") },
      { key: "qty", label: t("document.qty"), align: "right" },
      { key: "unit", label: t("document.unit"), align: "center" },
      { key: "costPrice", label: t("document.price"), align: "right" },
      { key: "batchNumber", label: t("document.batchNumber") },
      { key: "expiryDate", label: t("document.expiryDate") }
    ],
    rows: (d.items || []).map((it) => ({
      item: it.productData?.nameProduct || it.ingredientName || "-",
      qty: it.qtyReceived || 0,
      unit: it.unit || "-",
      costPrice: it.costPrice != null ? `Rp ${Number(it.costPrice).toLocaleString("id-ID")}` : "-",
      batchNumber: it.batchNumber || "-",
      expiryDate: it.expiryDate || "-"
    })),
    totals: [],
    signature: {
      preparedBy: d.picData?.fullName,
      knownBy: d.createdByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};

export const getDocumentSpecForSupplier = (d, t) => ({
  title: t("document.dataSupplier"),
  number: d.name,
  meta: [
    { label: t("document.contactPerson"), value: d.contactPerson },
    { label: t("document.address"), value: d.address },
    { label: t("document.phone"), value: d.phone },
    { label: t("document.code"), value: d.mobile || d.whatsapp },
    { label: t("document.email"), value: d.email },
    { label: t("page.supplier.form.category"), value: d.categoryData?.name },
    { label: t("page.supplier.form.paymentType"), value: d.paymentType },
    { label: t("page.supplier.form.tempoDays"), value: d.tempoDays },
    { label: t("page.supplier.form.taxNumber"), value: d.taxNumber }
  ],
  columns: [
    { key: "name", label: t("document.name") },
    { key: "phone", label: t("document.phone") },
    { key: "email", label: t("document.email") },
    { key: "position", label: t("document.position") }
  ],
  rows: (d.contacts || []).map((c) => ({
    name: c.fullName || "-",
    phone: c.phone || "-",
    email: c.email || "-",
    position: c.position || "-"
  })),
  totals: [],
  signature: {
    preparedBy: d.contactPerson,
    knownBy: d.createdByUser?.fullName,
    approvedBy: d.approvedByUser?.fullName
  }
});

export const getDocumentSpecForPurchaseOrder = (d, t) => {
  const statusKey = `purchaseOrder.status.${d.status || "pending"}`;
  const items = d.items || [];
  return {
    title: t("document.suratPesanan"),
    number: d.orderNumber,
    meta: [
      {
        label: t("page.purchaseOrder.detail.supplier"),
        value: d.supplierData?.name || d.supplierNames
      },
      { label: t("page.purchaseOrder.detail.store"), value: d.storeData?.name },
      { label: t("document.date"), value: d.orderDate },
      { label: t("page.purchaseOrder.detail.dueDate"), value: d.dueDate },
      { label: t("page.purchaseOrder.detail.paymentMethod"), value: d.paymentMethod },
      { label: t("document.status"), value: t(statusKey) }
    ],
    columns: [
      { key: "item", label: t("document.item") },
      { key: "qty", label: t("document.qty"), align: "right" },
      { key: "unit", label: t("document.unit"), align: "center" },
      { key: "price", label: t("document.price"), align: "right" },
      { key: "total", label: t("document.total"), align: "right" }
    ],
    rows: items.map((it) => {
      const lineTotal =
        it.totalPrice != null
          ? it.totalPrice
          : Number(it.quantity) * Number(it.price || it.purchasePrice);
      return {
        item: it.ingredientData?.name || it.productData?.nameProduct || "-",
        qty: it.quantity,
        unit: it.unit || "-",
        price: it.price != null ? `Rp ${Number(it.price).toLocaleString("id-ID")}` : "-",
        total: `Rp ${Number(lineTotal).toLocaleString("id-ID")}`
      };
    }),
    totals: [
      {
        label: t("document.subtotal"),
        value: `Rp ${Number(d.totalAmount || 0).toLocaleString("id-ID")}`
      },
      {
        label: t("document.discount"),
        value: `Rp ${Number(d.discount || 0).toLocaleString("id-ID")}`
      },
      {
        label: t("document.fee"),
        value: `Rp ${Number(d.additionalCost || 0).toLocaleString("id-ID")}`
      },
      {
        label: t("document.grandTotal"),
        value: `Rp ${Number(d.finalAmount || 0).toLocaleString("id-ID")}`
      }
    ],
    signature: {
      preparedBy: d.createdByUser?.fullName,
      knownBy: d.approvedByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};

export const getDocumentSpecForPurchaseReturn = (d, t) => {
  const statusKey = `purchaseReturn.status.${d.status || "pending"}`;
  return {
    title: t("document.suratReturPembelian"),
    number: d.returnNumber,
    meta: [
      { label: t("page.purchaseReturn.detail.field.store"), value: d.storeData?.name },
      { label: t("page.purchaseReturn.detail.field.reason"), value: d.reason },
      {
        label: t("page.purchaseReturn.detail.field.poNumber"),
        value: d.purchaseOrder?.orderNumber
      },
      { label: t("document.date"), value: d.createdAt },
      { label: t("document.status"), value: t(statusKey) }
    ],
    columns: [
      { key: "item", label: t("document.item") },
      { key: "qty", label: t("document.qty"), align: "right" },
      { key: "unit", label: t("document.unit"), align: "center" },
      { key: "price", label: t("document.price"), align: "right" },
      { key: "subtotal", label: t("document.subtotal"), align: "right" }
    ],
    rows: (d.items || []).map((it) => {
      const subtotal = it.subtotal != null ? it.subtotal : Number(it.qty) * Number(it.price);
      return {
        item: it.product?.name || it.ingredient?.name || it.ingredientName || "-",
        qty: it.qty,
        unit: it.unit || "-",
        price: it.price != null ? `Rp ${Number(it.price).toLocaleString("id-ID")}` : "-",
        subtotal: `Rp ${Number(subtotal).toLocaleString("id-ID")}`
      };
    }),
    totals: [
      {
        label: t("document.grandTotal"),
        value: `Rp ${Number(d.totalAmount || 0).toLocaleString("id-ID")}`
      }
    ],
    signature: {
      preparedBy: d.createdByUser?.fullName,
      knownBy: d.approvedByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};

export const getDocumentSpecForStockOpname = (d, t) => {
  const statusKey = `stockOpname.status.${d.status || "draft"}`;
  return {
    title: t("document.beritaAcaraStokOpname"),
    number: `STOCK-${d.auditId || ""}`,
    meta: [
      { label: t("page.stockOpname.detail.store"), value: d.store?.name },
      { label: t("page.stockOpname.detail.auditor"), value: d.auditor },
      { label: t("document.date"), value: d.auditDate },
      { label: t("document.status"), value: t(statusKey) }
    ],
    columns: [
      { key: "kode", label: t("document.code") },
      { key: "nama", label: t("document.name") },
      { key: "satuan", label: t("document.unit"), align: "center" },
      { key: "stokAkhir", label: t("document.stockEnd"), align: "right" },
      { key: "stokFisik", label: t("document.stockPhysical"), align: "right" },
      { key: "selisih", label: t("document.stockDiff"), align: "right" }
    ],
    rows: (d.items || []).map((it) => ({
      kode: it.kodeBarang || "-",
      nama: it.namaBarang || "-",
      satuan: it.satuan || "-",
      stokAkhir: it.stokAkhirJumlah ?? it.stokAkhir ?? "-",
      stokFisik: it.stokFisikJumlah ?? it.stokFisik ?? "-",
      selisih: it.selisihJumlah ?? it.selisih ?? "-"
    })),
    totals: [],
    signature: {
      preparedBy: d.auditor,
      knownBy: d.createdByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};

export const getDocumentSpecForDelivery = (d, t) => {
  const statusKey = `delivery.status.${d.status || "pending"}`;
  return {
    title: t("document.dokumenPengiriman"),
    number: d.orderNumber,
    meta: [
      { label: t("page.delivery.detail.customer"), value: d.customerName },
      { label: t("page.delivery.detail.phone"), value: d.customerPhone },
      { label: t("page.delivery.detail.address"), value: d.deliveryAddress },
      {
        label: t("page.delivery.detail.deliveryFee"),
        value: d.deliveryFee != null ? `Rp ${Number(d.deliveryFee).toLocaleString("id-ID")}` : "-"
      },
      { label: t("document.status"), value: t(statusKey) },
      ...(d.driver || d.driverName
        ? [
            { label: t("page.delivery.detail.driver"), value: d.driverName || d.driver?.name },
            {
              label: t("document.vehicle"),
              value: d.driver?.vehicle?.vehicleNumber || d.driverVehicle || "-"
            }
          ]
        : [])
    ],
    columns: [],
    rows: [],
    totals: [],
    signature: {
      preparedBy: d.createdByUser?.fullName,
      knownBy: d.approvedByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};

export const getDocumentSpecForProductionOrder = (d, t) => {
  const statusKey = `productionOrder.status.${d.status || "pending"}`;
  const plannedQty = Number(d.plannedQty || d.quantity || 0);
  return {
    title: t("document.suratPerintahProduksi"),
    number: d.productionNo,
    meta: [
      { label: t("page.productionOrder.detail.produk"), value: d.productData?.nameProduct },
      { label: t("page.productionOrder.detail.store"), value: d.storeData?.name },
      { label: t("page.productionOrder.detail.tanggalJadwal"), value: d.scheduledDate },
      { label: t("page.productionOrder.detail.jumlahRencana"), value: plannedQty },
      { label: t("document.status"), value: t(statusKey) }
    ],
    columns: [
      { key: "ingredient", label: t("document.item") },
      { key: "qty", label: t("document.qty"), align: "right" },
      { key: "unit", label: t("document.unit"), align: "center" },
      { key: "totalRequired", label: t("document.totalRequired"), align: "right" }
    ],
    rows: (d.bomComponents || []).map((it) => ({
      ingredient: it.ingredientName || it.name || "-",
      qty: it.qty,
      unit: it.unit || "-",
      totalRequired: Number(it.qty) * plannedQty || 0
    })),
    totals: [],
    signature: {
      preparedBy: d.createdByUser?.fullName,
      knownBy: d.approvedByUser?.fullName,
      approvedBy: d.approvedByUser?.fullName
    }
  };
};
