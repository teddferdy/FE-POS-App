import {
  Crown,
  Calculator,
  UtensilsCrossed,
  Users,
  BookUser,
  CalendarDays,
  Store,
  Package,
  Tag,
  BarChart3,
  Settings,
  FileText,
  Building2,
  CreditCard,
  Percent,
  Warehouse,
  Table,
  ShoppingCart,
  TrendingUp,
  Receipt,
  ClipboardList,
  Award,
  TriangleAlert,
  Shield,
  ArrowRightLeft,
  DollarSign,
  BadgePercent,
  ChefHat,
  Wallet,
  Database,
  QrCode,
  ShoppingBag,
  FlaskConical,
  Truck,
  Megaphone,
  Clock,
  HandPlatter,
  // MonitorPlay,
  Landmark
} from "lucide-react";

export const sidebarMenuSuperAdmin = [
  {
    title: "Dashboard",
    i18nKey: "sidebar.dashboardSuperAdmin",
    href: "/dashboard-super-admin",
    icon: Crown,
    children: [],
    actions: ["view"],
    activePaths: ["/low-stock-all", "/low-stock"]
  },
  {
    title: "POS & Penjualan",
    section: true,
    i18nKey: "sidebar.section.posPenjualan",
    icon: Calculator,
    children: [
      {
        title: "Kasir",
        i18nKey: "sidebar.cashier",
        href: "/home",
        icon: Calculator,
        actions: ["view", "add"]
      },
      {
        title: "Kasir (Register)",
        i18nKey: "sidebar.cashRegister",
        href: "/cash-register/current",
        icon: DollarSign,
        actions: ["view", "add"]
      },
      {
        title: "Laporan X/Z",
        i18nKey: "sidebar.xzReport",
        href: "/cash-register/xz-report",
        icon: FileText,
        actions: ["view"]
      },
      {
        title: "Dapur (KDS)",
        i18nKey: "sidebar.kitchenDisplay",
        href: "/kitchen-display",
        icon: ChefHat,
        actions: ["view"]
      },
      // {
      //   title: "Layar Pesanan Pelanggan",
      //   i18nKey: "sidebar.customerDisplayBoard",
      //   href: "/customer-display-board",
      //   icon: MonitorPlay,
      //   external: true,
      //   actions: ["view"]
      // },
      {
        title: "QR Orders",
        i18nKey: "sidebar.qrOrders",
        href: "/qr-order-management",
        icon: QrCode,
        actions: ["view"]
      },
      {
        title: "Meja",
        i18nKey: "sidebar.meja",
        href: "/table-list",
        icon: Table,
        actions: ["add", "edit", "view", "delete", "update-status"]
      },
      {
        title: "Reservasi Meja",
        i18nKey: "sidebar.reservation",
        href: "/reservation",
        icon: CalendarDays,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Queue Management",
        i18nKey: "sidebar.queue",
        href: "/queue-list",
        icon: Clock,
        actions: ["view", "add", "edit"]
      },
      {
        title: "Permintaan Pelayan",
        i18nKey: "sidebar.waiterRequest",
        href: "/waiter-request",
        icon: HandPlatter,
        actions: ["view", "edit"]
      },
      {
        title: "Sales Return",
        i18nKey: "sidebar.salesReturn",
        href: "/sales-return",
        icon: ShoppingCart,
        actions: ["view"],
        activePaths: ["/sales-return/create", "/sales-return/detail"]
      },
      {
        title: "Piutang (AR)",
        i18nKey: "sidebar.piutang",
        href: "/accounts-receivable",
        icon: Receipt,
        actions: ["view"]
      }
    ]
  },
  {
    title: "Master Data",
    section: true,
    i18nKey: "sidebar.section.masterData",
    icon: Store,
    children: [
      {
        title: "Kelola Toko",
        i18nKey: "sidebar.kelolaToko",
        href: "/location-list",
        icon: Store,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Harga per Toko",
        i18nKey: "sidebar.pricePerStore",
        href: "/price-list-template",
        icon: BadgePercent,
        actions: ["view", "edit"]
      }
    ]
  },
  {
    title: "Produk & Promo",
    section: true,
    i18nKey: "sidebar.section.produkPromo",
    icon: ShoppingBag,
    children: [
      {
        title: "Kategori",
        i18nKey: "sidebar.kategori",
        href: "/category-list",
        icon: Tag,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Daftar Produk",
        i18nKey: "sidebar.daftarProduk",
        href: "/product-list",
        icon: UtensilsCrossed,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Paket / Bundle",
        i18nKey: "sidebar.bundle",
        href: "/bundle",
        icon: Package,
        actions: ["view", "add", "edit", "delete"],
        activePaths: ["/bundle/add", "/bundle/edit"]
      },
      {
        title: "Diskon & Voucher",
        i18nKey: "sidebar.diskon",
        href: "/discount-list",
        icon: BadgePercent,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Kampanye Promo",
        i18nKey: "sidebar.promo",
        href: "/promo-list",
        icon: Megaphone,
        actions: ["view", "add", "edit", "delete"]
      }
    ]
  },
  {
    title: "Bahan Baku & Pembelian",
    section: true,
    i18nKey: "sidebar.section.bahanBakuPembelian",
    icon: FlaskConical,
    children: [
      {
        title: "Kategori Supplier",
        i18nKey: "sidebar.supplierCategory",
        href: "/supplier-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Supplier",
        i18nKey: "sidebar.supplier",
        href: "/supplier",
        icon: Building2,
        activePaths: [
          "/supplier-comparison",
          "/add-supplier",
          "/edit-supplier",
          "/detail-supplier"
        ],
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Supplier Scores",
        i18nKey: "sidebar.supplierPerformance",
        href: "/supplier-score-list",
        icon: TrendingUp,
        actions: ["view", "add"]
      },
      {
        title: "Kategori Bahan Baku",
        i18nKey: "sidebar.ingredientCategory",
        href: "/ingredient-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Bahan Baku",
        i18nKey: "sidebar.bahanBaku",
        href: "/ingredient",
        icon: Package,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Purchase Order",
        i18nKey: "sidebar.purchaseOrder",
        href: "/purchase-order",
        icon: ShoppingCart,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Permintaan Barang",
        i18nKey: "sidebar.goodsRequest",
        href: "/goods-request",
        icon: ClipboardList,
        activePaths: ["/goods-request/detail", "/add-goods-request", "/edit-goods-request"],
        actions: ["view", "add", "edit", "delete"]
      },
      {
        title: "Goods Receipt",
        i18nKey: "sidebar.goodsReceipt",
        href: "/goods-receipt",
        icon: FileText,
        actions: ["add", "view", "delete"]
      },
      {
        title: "Purchase Return",
        i18nKey: "sidebar.purchaseReturn",
        href: "/purchase-return",
        icon: ShoppingCart,
        activePaths: ["/purchase-return/detail"],
        actions: ["view"]
      },
      {
        title: "Dashboard Utang (AP)",
        i18nKey: "sidebar.apDashboard",
        href: "/ap-dashboard",
        icon: Wallet,
        actions: ["view"]
      },
      {
        title: "Riwayat Pembayaran",
        i18nKey: "sidebar.purchasePayment",
        href: "/purchase-payment",
        icon: Wallet,
        actions: ["view"]
      }
    ]
  },
  {
    title: "Gudang, Produksi & Delivery",
    section: true,
    i18nKey: "sidebar.section.gudangOperasional",
    icon: Warehouse,
    children: [
      {
        title: "Stock Opname",
        i18nKey: "sidebar.stockOpname",
        href: "/stock-opname",
        icon: ClipboardList,
        actions: ["add", "view"]
      },
      {
        title: "Stock Adjustment",
        href: "/stock-adjustment",
        icon: Package,
        actions: ["add"]
      },
      {
        title: "Transfer Stok",
        i18nKey: "sidebar.transferStok",
        href: "/stock-transfer",
        icon: ArrowRightLeft,
        actions: ["view", "add", "delete"]
      },
      {
        title: "History Stok",
        i18nKey: "sidebar.historyStok",
        href: "/stock-history",
        icon: FileText,
        actions: ["view"]
      },
      {
        title: "Low Stock",
        i18nKey: "sidebar.lowStock",
        href: "/low-stock",
        icon: TriangleAlert,
        actions: ["view"]
      },
      {
        title: "Production Order",
        i18nKey: "sidebar.productionOrder",
        href: "/production-order",
        icon: Package,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "BOM",
        i18nKey: "sidebar.bom",
        href: "/bom",
        icon: ClipboardList,
        actions: ["add", "view", "delete"]
      },
      {
        title: "Delivery Orders",
        i18nKey: "sidebar.deliveryOrders",
        href: "/delivery-orders",
        icon: Truck,
        actions: ["view", "add", "edit"]
      },
      {
        title: "Driver",
        i18nKey: "sidebar.driver",
        href: "/driver-list",
        icon: Users,
        actions: ["view", "add", "edit", "delete"]
      }
    ]
  },
  {
    title: "Keuangan & Laporan",
    section: true,
    i18nKey: "sidebar.section.keuanganLaporan",
    icon: DollarSign,
    children: [
      {
        title: "Kategori Pengeluaran",
        i18nKey: "sidebar.kategoriPengeluaran",
        href: "/expense-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Pengeluaran",
        i18nKey: "sidebar.daftarPengeluaran",
        href: "/expense",
        icon: Receipt,
        actions: ["add", "edit", "view", "approve"]
      },
      {
        title: "Akuntansi",
        i18nKey: "sidebar.accounting",
        href: "/accounting",
        icon: Landmark,
        actions: ["view"]
      },
      {
        title: "Penjualan",
        i18nKey: "sidebar.penjualan",
        href: "/report/sales",
        icon: TrendingUp,
        actions: ["view", "export"]
      },
      {
        title: "Produk Terlaris",
        i18nKey: "sidebar.produkTerlaris",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view", "export"]
      },
      {
        title: "Laporan Harian",
        i18nKey: "sidebar.laporanHarian",
        href: "/report/daily",
        icon: ClipboardList,
        actions: ["view"]
      },
      {
        title: "Arus Kas",
        i18nKey: "sidebar.arusKas",
        href: "/report/cash-flow",
        icon: Receipt,
        actions: ["view"]
      }
    ]
  },
  {
    title: "Membership & SDM",
    section: true,
    i18nKey: "sidebar.section.membershipSdm",
    icon: BookUser,
    children: [
      {
        title: "Member Tier",
        i18nKey: "sidebar.memberTier",
        href: "/member-tier",
        icon: Award,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Member",
        i18nKey: "sidebar.daftarMember",
        href: "/member-list",
        icon: BookUser,
        actions: ["add", "edit", "view", "edit-points"]
      },
      {
        title: "Departemen",
        i18nKey: "sidebar.departemen",
        href: "/department-list",
        icon: Building2,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Posisi",
        i18nKey: "sidebar.posisi",
        href: "/position-list",
        icon: FileText,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Karyawan",
        i18nKey: "sidebar.daftarKaryawan",
        href: "/employee-list",
        icon: Users,
        actions: ["add", "view", "edit-access", "reset-password"]
      },
      {
        title: "Shift",
        i18nKey: "sidebar.shift",
        href: "/shift-list",
        icon: CalendarDays,
        actions: ["add", "edit", "view", "delete"]
      }
    ]
  },
  {
    title: "Pengaturan",
    section: true,
    i18nKey: "sidebar.section.pengaturan",
    icon: Settings,
    children: [
      {
        title: "Invoice & Struk",
        i18nKey: "sidebar.invoiceStruk",
        href: "/invoice-page",
        icon: FileText,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Pajak",
        i18nKey: "sidebar.pajak",
        href: "/tax-list",
        icon: Percent,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Metode Pembayaran",
        i18nKey: "sidebar.metodePembayaran",
        href: "/type-payment-list",
        icon: CreditCard,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Manajemen Role & Izin",
        i18nKey: "sidebar.roleManagement",
        href: "/role-management",
        icon: Shield,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Backup & Restore",
        i18nKey: "sidebar.backup",
        href: "/backup",
        icon: Database,
        actions: ["view"]
      }
    ]
  }
];

export const sidebarMenuAdmin = [
  {
    title: "Dashboard",
    i18nKey: "sidebar.dashboardAdmin",
    href: "/dashboard-admin",
    icon: Crown,
    actions: ["view"],
    activePaths: ["/low-stock-all", "/low-stock"]
  },
  {
    title: "POS & Penjualan",
    section: true,
    i18nKey: "sidebar.section.posPenjualan",
    icon: Calculator,
    children: [
      {
        title: "Kasir",
        i18nKey: "sidebar.cashier",
        href: "/home",
        icon: Calculator,
        actions: ["view", "add"]
      },
      {
        title: "Kasir (Register)",
        i18nKey: "sidebar.cashRegister",
        href: "/cash-register/current",
        icon: DollarSign,
        actions: ["view", "add"]
      },
      {
        title: "Laporan X/Z",
        i18nKey: "sidebar.xzReport",
        href: "/cash-register/xz-report",
        icon: FileText,
        actions: ["view"]
      },
      {
        title: "Dapur (KDS)",
        i18nKey: "sidebar.kitchenDisplay",
        href: "/kitchen-display",
        icon: ChefHat,
        actions: ["view"]
      },
      // {
      //   title: "Layar Pesanan Pelanggan",
      //   i18nKey: "sidebar.customerDisplayBoard",
      //   href: "/customer-display-board",
      //   icon: MonitorPlay,
      //   external: true,
      //   actions: ["view"]
      // },
      {
        title: "QR Orders",
        i18nKey: "sidebar.qrOrders",
        href: "/qr-order-management",
        icon: QrCode,
        actions: ["view"]
      },
      {
        title: "Meja",
        i18nKey: "sidebar.meja",
        href: "/table-list",
        icon: Table,
        actions: ["add", "edit", "view", "delete", "update-status"]
      },
      {
        title: "Reservasi Meja",
        i18nKey: "sidebar.reservation",
        href: "/reservation",
        icon: CalendarDays,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Queue Management",
        i18nKey: "sidebar.queue",
        href: "/queue-list",
        icon: Clock,
        actions: ["view", "add", "edit"]
      },
      {
        title: "Permintaan Pelayan",
        i18nKey: "sidebar.waiterRequest",
        href: "/waiter-request",
        icon: HandPlatter,
        actions: ["view", "edit"]
      },
      {
        title: "Sales Return",
        i18nKey: "sidebar.salesReturn",
        href: "/sales-return",
        icon: ShoppingCart,
        actions: ["view"],
        activePaths: ["/sales-return/create", "/sales-return/detail"]
      },
      {
        title: "Piutang (AR)",
        i18nKey: "sidebar.piutang",
        href: "/accounts-receivable",
        icon: Receipt,
        actions: ["view"]
      }
    ]
  },
  {
    title: "Produk & Promo",
    section: true,
    i18nKey: "sidebar.section.produkPromo",
    icon: ShoppingBag,
    children: [
      {
        title: "Kategori",
        i18nKey: "sidebar.kategori",
        href: "/category-list",
        icon: Tag,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Daftar Produk",
        i18nKey: "sidebar.daftarProduk",
        href: "/product-list",
        icon: UtensilsCrossed,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Harga per Toko",
        i18nKey: "sidebar.pricePerStore",
        href: "/price-list-template",
        icon: BadgePercent,
        actions: ["view", "edit"]
      },
      {
        title: "Paket / Bundle",
        i18nKey: "sidebar.bundle",
        href: "/bundle",
        icon: Package,
        actions: ["view", "add", "edit", "delete"],
        activePaths: ["/bundle/add", "/bundle/edit"]
      },
      {
        title: "Diskon & Voucher",
        i18nKey: "sidebar.diskon",
        href: "/discount-list",
        icon: BadgePercent,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Kampanye Promo",
        i18nKey: "sidebar.promo",
        href: "/promo-list",
        icon: Megaphone,
        actions: ["view", "add", "edit", "delete"]
      }
    ]
  },
  {
    title: "Bahan Baku & Pembelian",
    section: true,
    i18nKey: "sidebar.section.bahanBakuPembelian",
    icon: FlaskConical,
    children: [
      {
        title: "Kategori Supplier",
        i18nKey: "sidebar.supplierCategory",
        href: "/supplier-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Supplier",
        i18nKey: "sidebar.supplier",
        href: "/supplier",
        icon: Building2,
        activePaths: [
          "/supplier-comparison",
          "/add-supplier",
          "/edit-supplier",
          "/detail-supplier"
        ],
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Supplier Scores",
        i18nKey: "sidebar.supplierPerformance",
        href: "/supplier-score-list",
        icon: TrendingUp,
        actions: ["view", "add"]
      },
      {
        title: "Kategori Bahan Baku",
        i18nKey: "sidebar.ingredientCategory",
        href: "/ingredient-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Bahan Baku",
        i18nKey: "sidebar.bahanBaku",
        href: "/ingredient",
        icon: Package,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Purchase Order",
        i18nKey: "sidebar.purchaseOrder",
        href: "/purchase-order",
        icon: ShoppingCart,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Permintaan Barang",
        i18nKey: "sidebar.goodsRequest",
        href: "/goods-request",
        icon: ClipboardList,
        activePaths: ["/goods-request/detail", "/add-goods-request", "/edit-goods-request"],
        actions: ["view", "add", "edit", "delete"]
      },
      {
        title: "Goods Receipt",
        i18nKey: "sidebar.goodsReceipt",
        href: "/goods-receipt",
        icon: FileText,
        actions: ["add", "view", "delete"]
      },
      {
        title: "Purchase Return",
        i18nKey: "sidebar.purchaseReturn",
        href: "/purchase-return",
        icon: ShoppingCart,
        activePaths: ["/purchase-return/detail"],
        actions: ["view"]
      },
      {
        title: "Dashboard Utang (AP)",
        i18nKey: "sidebar.apDashboard",
        href: "/ap-dashboard",
        icon: Wallet,
        actions: ["view"]
      },
      {
        title: "Riwayat Pembayaran",
        i18nKey: "sidebar.purchasePayment",
        href: "/purchase-payment",
        icon: Wallet,
        actions: ["view"]
      }
    ]
  },
  {
    title: "Gudang, Produksi & Delivery",
    section: true,
    i18nKey: "sidebar.section.gudangOperasional",
    icon: Warehouse,
    children: [
      {
        title: "Stock Opname",
        i18nKey: "sidebar.stockOpname",
        href: "/stock-opname",
        icon: ClipboardList,
        actions: ["add", "view"]
      },
      {
        title: "Stock Adjustment",
        href: "/stock-adjustment",
        icon: Package,
        actions: ["add"]
      },
      {
        title: "Transfer Stok",
        i18nKey: "sidebar.transferStok",
        href: "/stock-transfer",
        icon: ArrowRightLeft,
        actions: ["view", "add", "delete"]
      },
      {
        title: "History Stok",
        i18nKey: "sidebar.historyStok",
        href: "/stock-history",
        icon: FileText,
        actions: ["view"]
      },
      {
        title: "Low Stock",
        i18nKey: "sidebar.lowStock",
        href: "/low-stock",
        icon: TriangleAlert,
        actions: ["view"]
      },
      {
        title: "Production Order",
        i18nKey: "sidebar.productionOrder",
        href: "/production-order",
        icon: Package,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "BOM",
        i18nKey: "sidebar.bom",
        href: "/bom",
        icon: ClipboardList,
        actions: ["add", "view", "delete"]
      },
      {
        title: "Delivery Orders",
        i18nKey: "sidebar.deliveryOrders",
        href: "/delivery-orders",
        icon: Truck,
        actions: ["view", "add", "edit"]
      },
      {
        title: "Driver",
        i18nKey: "sidebar.driver",
        href: "/driver-list",
        icon: Users,
        actions: ["view", "add", "edit", "delete"]
      }
    ]
  },
  {
    title: "Keuangan & Laporan",
    section: true,
    i18nKey: "sidebar.section.keuanganLaporan",
    icon: DollarSign,
    children: [
      {
        title: "Kategori Pengeluaran",
        i18nKey: "sidebar.kategoriPengeluaran",
        href: "/expense-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Pengeluaran",
        i18nKey: "sidebar.daftarPengeluaran",
        href: "/expense",
        icon: Receipt,
        actions: ["add", "edit", "view", "approve"]
      },
      {
        title: "Pajak",
        i18nKey: "sidebar.pajak",
        href: "/tax-list",
        icon: Percent,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Penjualan",
        i18nKey: "sidebar.penjualan",
        href: "/report/sales",
        icon: TrendingUp,
        actions: ["view", "export"]
      },
      {
        title: "Best Selling",
        i18nKey: "sidebar.produkTerlaris",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view", "export"]
      }
    ]
  },
  {
    title: "Membership & SDM",
    section: true,
    i18nKey: "sidebar.section.membershipSdm",
    icon: BookUser,
    children: [
      {
        title: "Member Tier",
        i18nKey: "sidebar.memberTier",
        href: "/member-tier",
        icon: TrendingUp,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Member",
        i18nKey: "sidebar.daftarMember",
        href: "/member-list",
        icon: BookUser,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Departemen",
        i18nKey: "sidebar.departemen",
        href: "/department-list",
        icon: Building2,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Posisi",
        i18nKey: "sidebar.posisi",
        href: "/position-list",
        icon: FileText,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Karyawan",
        i18nKey: "sidebar.daftarKaryawan",
        href: "/user-list",
        icon: Users,
        actions: ["add", "edit", "view", "edit-access"]
      },
      {
        title: "Shift",
        i18nKey: "sidebar.shift",
        href: "/shift-list",
        icon: CalendarDays,
        actions: ["add", "edit", "view", "delete"]
      }
    ]
  },
  {
    title: "Pengaturan",
    section: true,
    i18nKey: "sidebar.section.pengaturan",
    icon: Settings,
    children: [
      {
        title: "Metode Pembayaran",
        i18nKey: "sidebar.metodePembayaran",
        href: "/type-payment-list",
        icon: CreditCard,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Invoice & Struk",
        i18nKey: "sidebar.invoiceStruk",
        href: "/invoice-page",
        icon: FileText,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Backup & Restore",
        i18nKey: "sidebar.backup",
        href: "/backup",
        icon: Database,
        actions: ["view"]
      }
    ]
  }
];

// Pemetaan sub-grup menu (AccessMenuModal & NavigationModal): key = i18nKey section, lalu href -> nama sub-grup
const accessMenuSubGroups = {
  "sidebar.section.posPenjualan": {
    "/home": "Kasir",
    "/cash-register/current": "Kasir",
    "/cash-register/xz-report": "Kasir",
    "/kitchen-display": "Pesanan & Dapur",
    "/qr-order-management": "Pesanan & Dapur",
    "/queue-list": "Pesanan & Dapur",
    "/waiter-request": "Pesanan & Dapur",
    "/table-list": "Meja & Reservasi",
    "/reservation": "Meja & Reservasi",
    "/sales-return": "Retur & Piutang",
    "/accounts-receivable": "Retur & Piutang"
  },
  "sidebar.section.produkPromo": {
    "/category-list": "Produk",
    "/product-list": "Produk",
    "/price-list-template": "Produk",
    "/bundle": "Promo",
    "/discount-list": "Promo",
    "/promo-list": "Promo"
  },
  "sidebar.section.bahanBakuPembelian": {
    "/supplier-category": "Supplier",
    "/supplier": "Supplier",
    "/supplier-score-list": "Supplier",
    "/ingredient-category": "Bahan Baku",
    "/ingredient": "Bahan Baku",
    "/purchase-order": "Pembelian",
    "/goods-request": "Pembelian",
    "/goods-receipt": "Pembelian",
    "/purchase-return": "Pembelian",
    "/ap-dashboard": "Pembayaran",
    "/purchase-payment": "Pembayaran"
  },
  "sidebar.section.gudangOperasional": {
    "/stock-opname": "Manajemen Stok",
    "/stock-adjustment": "Manajemen Stok",
    "/stock-transfer": "Manajemen Stok",
    "/stock-history": "Monitoring Stok",
    "/low-stock": "Monitoring Stok",
    "/production-order": "Produksi",
    "/bom": "Produksi",
    "/delivery-orders": "Delivery",
    "/driver-list": "Delivery"
  },
  "sidebar.section.keuanganLaporan": {
    "/expense-category": "Pengeluaran",
    "/expense": "Pengeluaran",
    "/accounting": "Akuntansi & Pajak",
    "/tax-list": "Akuntansi & Pajak",
    "/report/sales": "Laporan Penjualan",
    "/best-selling": "Laporan Penjualan",
    "/report/daily": "Laporan Keuangan",
    "/report/cash-flow": "Laporan Keuangan"
  },
  "sidebar.section.membershipSdm": {
    "/member-tier": "Membership",
    "/member-list": "Membership",
    "/department-list": "Organisasi",
    "/position-list": "Organisasi",
    "/employee-list": "Karyawan & Shift",
    "/user-list": "Karyawan & Shift",
    "/shift-list": "Karyawan & Shift"
  },
  "sidebar.section.pengaturan": {
    "/invoice-page": "Struk & Pembayaran",
    "/type-payment-list": "Struk & Pembayaran",
    "/tax-list": "Struk & Pembayaran",
    "/role-management": "Sistem & Keamanan",
    "/backup": "Sistem & Keamanan"
  }
};

[sidebarMenuSuperAdmin, sidebarMenuAdmin].forEach((menu) => {
  menu.forEach((section) => {
    const mapping = accessMenuSubGroups[section.i18nKey];
    if (!mapping || !Array.isArray(section.children)) return;
    section.children.forEach((child) => {
      if (mapping[child.href]) child.group = mapping[child.href];
    });
  });
});

export const sidebarMenuCashier = [
  {
    title: "Cashier",
    i18nKey: "sidebar.cashier",
    href: "/home",
    icon: Calculator,
    actions: ["add", "view"]
  },
  {
    title: "Membership",
    i18nKey: "sidebar.membership",
    href: "/member-list",
    icon: BookUser,
    actions: ["view"]
  }
  // ponytail: hidden until implemented — dead link confuses users
  // {
  //   title: "My Shift (Coming Soon)",
  //   i18nKey: "sidebar.myShift",
  //   href: "#",
  //   icon: CalendarDays,
  //   actions: ["view"]
  // }
];

export const sidebarMenuUser = [
  {
    title: "Dashboard",
    i18nKey: "sidebar.dashboardAdmin",
    href: "/dashboard-admin",
    icon: Crown,
    children: [],
    actions: ["view"]
  },
  {
    title: "Membership",
    i18nKey: "sidebar.membership",
    href: "/member-list",
    icon: BookUser,
    actions: ["view"]
  },
  {
    title: "Laporan",
    i18nKey: "sidebar.laporan",
    href: "",
    icon: BarChart3,
    children: [
      {
        title: "Penjualan",
        i18nKey: "sidebar.penjualan",
        href: "/report/sales",
        icon: TrendingUp,
        actions: ["view"]
      },
      {
        title: "Produk Terlaris",
        i18nKey: "sidebar.produkTerlaris",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view"]
      }
    ],
    actions: []
  }
];

export const navCategories = {
  super_admin: [
    {
      id: "produk",
      icon: ShoppingBag,
      title: "Produk & Promo",
      i18nKey: "sidebar.section.produkPromo",
      sections: [
        {
          title: "Master Data",
          i18nKey: "sidebar.section.masterData",
          items: [
            {
              title: "Kelola Toko",
              i18nKey: "sidebar.kelolaToko",
              href: "/location-list",
              icon: Store
            },
            {
              title: "Harga per Toko",
              i18nKey: "sidebar.pricePerStore",
              href: "/price-list-template",
              icon: BadgePercent
            }
          ]
        },
        {
          title: "Produk & Promo",
          i18nKey: "sidebar.section.produkPromo",
          items: [
            { title: "Kategori", i18nKey: "sidebar.kategori", href: "/category-list", icon: Tag },
            {
              title: "Daftar Produk",
              i18nKey: "sidebar.daftarProduk",
              href: "/product-list",
              icon: UtensilsCrossed
            },
            { title: "Paket / Bundle", i18nKey: "sidebar.bundle", href: "/bundle", icon: Package },
            {
              title: "Diskon & Voucher",
              i18nKey: "sidebar.diskon",
              href: "/discount-list",
              icon: BadgePercent
            },
            {
              title: "Kampanye Promo",
              i18nKey: "sidebar.promo",
              href: "/promo-list",
              icon: Megaphone
            }
          ]
        }
      ]
    },
    {
      id: "inventory",
      icon: Warehouse,
      title: "Inventory & Pembelian",
      i18nKey: "sidebar.section.bahanBakuPembelian",
      sections: [
        {
          title: "Supplier & Bahan Baku",
          i18nKey: "sidebar.section.bahanBakuPembelian",
          items: [
            { title: "Supplier", i18nKey: "sidebar.supplier", href: "/supplier", icon: Building2 },
            {
              title: "Kategori Supplier",
              i18nKey: "sidebar.supplierCategory",
              href: "/supplier-category",
              icon: Tag
            },
            {
              title: "Kategori Bahan Baku",
              i18nKey: "sidebar.ingredientCategory",
              href: "/ingredient-category",
              icon: Tag
            },
            {
              title: "Bahan Baku",
              i18nKey: "sidebar.bahanBaku",
              href: "/ingredient",
              icon: Package
            },
            {
              title: "Permintaan Barang",
              i18nKey: "sidebar.goodsRequest",
              href: "/goods-request",
              icon: ClipboardList
            },
            {
              title: "Purchase Order",
              i18nKey: "sidebar.purchaseOrder",
              href: "/purchase-order",
              icon: ShoppingCart
            },
            {
              title: "Dashboard Utang (AP)",
              i18nKey: "sidebar.apDashboard",
              href: "/ap-dashboard",
              icon: Wallet
            },
            {
              title: "Riwayat Pembayaran",
              i18nKey: "sidebar.purchasePayment",
              href: "/purchase-payment",
              icon: Wallet
            },
            {
              title: "Goods Receipt",
              i18nKey: "sidebar.goodsReceipt",
              href: "/goods-receipt",
              icon: FileText
            },
            {
              title: "Purchase Return",
              i18nKey: "sidebar.purchaseReturn",
              href: "/purchase-return",
              icon: ShoppingCart
            },
            {
              title: "Supplier Scores",
              i18nKey: "sidebar.supplierPerformance",
              href: "/supplier-score-list",
              icon: TrendingUp
            }
          ]
        },
        {
          title: "Gudang & Produksi",
          i18nKey: "sidebar.section.gudangOperasional",
          items: [
            {
              title: "Stock Opname",
              i18nKey: "sidebar.stockOpname",
              href: "/stock-opname",
              icon: ClipboardList
            },
            { title: "Stock Adjustment", href: "/stock-adjustment", icon: Package },
            {
              title: "Transfer Stok",
              i18nKey: "sidebar.transferStok",
              href: "/stock-transfer",
              icon: ArrowRightLeft
            },
            {
              title: "History Stok",
              i18nKey: "sidebar.historyStok",
              href: "/stock-history",
              icon: FileText
            },
            {
              title: "Low Stock",
              i18nKey: "sidebar.lowStock",
              href: "/low-stock",
              icon: TriangleAlert
            },
            {
              title: "Production Order",
              i18nKey: "sidebar.productionOrder",
              href: "/production-order",
              icon: Package
            },
            { title: "BOM", i18nKey: "sidebar.bom", href: "/bom", icon: ClipboardList },
            {
              title: "Delivery Orders",
              i18nKey: "sidebar.deliveryOrders",
              href: "/delivery-orders",
              icon: Truck
            },
            { title: "Driver", i18nKey: "sidebar.driver", href: "/driver-list", icon: Users }
          ]
        }
      ]
    },
    {
      id: "laporan",
      icon: BarChart3,
      title: "Laporan & SDM",
      i18nKey: "sidebar.section.keuanganLaporan",
      sections: [
        {
          title: "Keuangan",
          i18nKey: "sidebar.section.keuanganLaporan",
          items: [
            {
              title: "Kategori Pengeluaran",
              i18nKey: "sidebar.kategoriPengeluaran",
              href: "/expense-category",
              icon: Tag
            },
            {
              title: "Daftar Pengeluaran",
              i18nKey: "sidebar.daftarPengeluaran",
              href: "/expense",
              icon: Receipt
            },
            {
              title: "Akuntansi",
              i18nKey: "sidebar.accounting",
              href: "/accounting",
              icon: Landmark
            },
            {
              title: "Penjualan",
              i18nKey: "sidebar.penjualan",
              href: "/report/sales",
              icon: TrendingUp
            },
            {
              title: "Produk Terlaris",
              i18nKey: "sidebar.produkTerlaris",
              href: "/best-selling",
              icon: BarChart3
            },
            {
              title: "Laporan Harian",
              i18nKey: "sidebar.laporanHarian",
              href: "/report/daily",
              icon: ClipboardList
            },
            {
              title: "Arus Kas",
              i18nKey: "sidebar.arusKas",
              href: "/report/cash-flow",
              icon: Receipt
            }
          ]
        },
        {
          title: "Membership & SDM",
          i18nKey: "sidebar.section.membershipSdm",
          items: [
            {
              title: "Member Tier",
              i18nKey: "sidebar.memberTier",
              href: "/member-tier",
              icon: Award
            },
            {
              title: "Daftar Member",
              i18nKey: "sidebar.daftarMember",
              href: "/member-list",
              icon: BookUser
            },
            {
              title: "Departemen",
              i18nKey: "sidebar.departemen",
              href: "/department-list",
              icon: Building2
            },
            { title: "Posisi", i18nKey: "sidebar.posisi", href: "/position-list", icon: FileText },
            {
              title: "Daftar Karyawan",
              i18nKey: "sidebar.daftarKaryawan",
              href: "/employee-list",
              icon: Users
            },
            { title: "Shift", i18nKey: "sidebar.shift", href: "/shift-list", icon: CalendarDays }
          ]
        }
      ]
    },
    {
      id: "pengaturan",
      icon: Settings,
      title: "Pengaturan",
      i18nKey: "sidebar.section.pengaturan",
      sections: [
        {
          title: "Pengaturan",
          i18nKey: "sidebar.section.pengaturan",
          items: [
            {
              title: "Invoice & Struk",
              i18nKey: "sidebar.invoiceStruk",
              href: "/invoice-page",
              icon: FileText
            },
            { title: "Pajak", i18nKey: "sidebar.pajak", href: "/tax-list", icon: Percent },
            {
              title: "Metode Pembayaran",
              i18nKey: "sidebar.metodePembayaran",
              href: "/type-payment-list",
              icon: CreditCard
            },
            {
              title: "Manajemen Role & Izin",
              i18nKey: "sidebar.roleManagement",
              href: "/role-management",
              icon: Shield
            },
            {
              title: "Backup & Restore",
              i18nKey: "sidebar.backup",
              href: "/backup",
              icon: Database
            }
          ]
        }
      ]
    }
  ],
  admin: [
    {
      id: "produk",
      icon: ShoppingBag,
      title: "Produk & Promo",
      i18nKey: "sidebar.section.produkPromo",
      sections: [
        {
          title: "Produk & Promo",
          i18nKey: "sidebar.section.produkPromo",
          items: [
            { title: "Kategori", i18nKey: "sidebar.kategori", href: "/category-list", icon: Tag },
            {
              title: "Daftar Produk",
              i18nKey: "sidebar.daftarProduk",
              href: "/product-list",
              icon: UtensilsCrossed
            },
            {
              title: "Harga per Toko",
              i18nKey: "sidebar.pricePerStore",
              href: "/price-list-template",
              icon: BadgePercent
            },
            { title: "Paket / Bundle", i18nKey: "sidebar.bundle", href: "/bundle", icon: Package },
            {
              title: "Diskon & Voucher",
              i18nKey: "sidebar.diskon",
              href: "/discount-list",
              icon: BadgePercent
            },
            {
              title: "Kampanye Promo",
              i18nKey: "sidebar.promo",
              href: "/promo-list",
              icon: Megaphone
            }
          ]
        }
      ]
    },
    {
      id: "inventory",
      icon: Warehouse,
      title: "Inventory & Pembelian",
      i18nKey: "sidebar.section.bahanBakuPembelian",
      sections: [
        {
          title: "Supplier & Bahan Baku",
          i18nKey: "sidebar.section.bahanBakuPembelian",
          items: [
            { title: "Supplier", i18nKey: "sidebar.supplier", href: "/supplier", icon: Building2 },
            {
              title: "Kategori Supplier",
              i18nKey: "sidebar.supplierCategory",
              href: "/supplier-category",
              icon: Tag
            },
            {
              title: "Kategori Bahan Baku",
              i18nKey: "sidebar.ingredientCategory",
              href: "/ingredient-category",
              icon: Tag
            },
            {
              title: "Bahan Baku",
              i18nKey: "sidebar.bahanBaku",
              href: "/ingredient",
              icon: Package
            },
            {
              title: "Permintaan Barang",
              i18nKey: "sidebar.goodsRequest",
              href: "/goods-request",
              icon: ClipboardList
            },
            {
              title: "Purchase Order",
              i18nKey: "sidebar.purchaseOrder",
              href: "/purchase-order",
              icon: ShoppingCart
            },
            {
              title: "Dashboard Utang (AP)",
              i18nKey: "sidebar.apDashboard",
              href: "/ap-dashboard",
              icon: Wallet
            },
            {
              title: "Riwayat Pembayaran",
              i18nKey: "sidebar.purchasePayment",
              href: "/purchase-payment",
              icon: Wallet
            },
            {
              title: "Goods Receipt",
              i18nKey: "sidebar.goodsReceipt",
              href: "/goods-receipt",
              icon: FileText
            },
            {
              title: "Purchase Return",
              i18nKey: "sidebar.purchaseReturn",
              href: "/purchase-return",
              icon: ShoppingCart
            },
            {
              title: "Supplier Scores",
              i18nKey: "sidebar.supplierPerformance",
              href: "/supplier-score-list",
              icon: TrendingUp
            }
          ]
        },
        {
          title: "Gudang & Produksi",
          i18nKey: "sidebar.section.gudangOperasional",
          items: [
            {
              title: "Stock Opname",
              i18nKey: "sidebar.stockOpname",
              href: "/stock-opname",
              icon: ClipboardList
            },
            { title: "Stock Adjustment", href: "/stock-adjustment", icon: Package },
            {
              title: "Transfer Stok",
              i18nKey: "sidebar.transferStok",
              href: "/stock-transfer",
              icon: ArrowRightLeft
            },
            {
              title: "History Stok",
              i18nKey: "sidebar.historyStok",
              href: "/stock-history",
              icon: FileText
            },
            {
              title: "Low Stock",
              i18nKey: "sidebar.lowStock",
              href: "/low-stock",
              icon: TriangleAlert
            },
            {
              title: "Production Order",
              i18nKey: "sidebar.productionOrder",
              href: "/production-order",
              icon: Package
            },
            { title: "BOM", i18nKey: "sidebar.bom", href: "/bom", icon: ClipboardList },
            {
              title: "Delivery Orders",
              i18nKey: "sidebar.deliveryOrders",
              href: "/delivery-orders",
              icon: Truck
            },
            { title: "Driver", i18nKey: "sidebar.driver", href: "/driver-list", icon: Users }
          ]
        }
      ]
    },
    {
      id: "laporan",
      icon: BarChart3,
      title: "Laporan & SDM",
      i18nKey: "sidebar.section.keuanganLaporan",
      sections: [
        {
          title: "Keuangan",
          i18nKey: "sidebar.section.keuanganLaporan",
          items: [
            {
              title: "Kategori Pengeluaran",
              i18nKey: "sidebar.kategoriPengeluaran",
              href: "/expense-category",
              icon: Tag
            },
            {
              title: "Daftar Pengeluaran",
              i18nKey: "sidebar.daftarPengeluaran",
              href: "/expense",
              icon: Receipt
            },
            { title: "Pajak", i18nKey: "sidebar.pajak", href: "/tax-list", icon: Percent },
            {
              title: "Penjualan",
              i18nKey: "sidebar.penjualan",
              href: "/report/sales",
              icon: TrendingUp
            },
            {
              title: "Best Selling",
              i18nKey: "sidebar.produkTerlaris",
              href: "/best-selling",
              icon: BarChart3
            }
          ]
        },
        {
          title: "Membership & SDM",
          i18nKey: "sidebar.section.membershipSdm",
          items: [
            {
              title: "Member Tier",
              i18nKey: "sidebar.memberTier",
              href: "/member-tier",
              icon: TrendingUp
            },
            {
              title: "Daftar Member",
              i18nKey: "sidebar.daftarMember",
              href: "/member-list",
              icon: BookUser
            },
            {
              title: "Departemen",
              i18nKey: "sidebar.departemen",
              href: "/department-list",
              icon: Building2
            },
            { title: "Posisi", i18nKey: "sidebar.posisi", href: "/position-list", icon: FileText },
            {
              title: "Daftar Karyawan",
              i18nKey: "sidebar.daftarKaryawan",
              href: "/user-list",
              icon: Users
            },
            { title: "Shift", i18nKey: "sidebar.shift", href: "/shift-list", icon: CalendarDays }
          ]
        }
      ]
    },
    {
      id: "pengaturan",
      icon: Settings,
      title: "Pengaturan",
      i18nKey: "sidebar.section.pengaturan",
      sections: [
        {
          title: "Pengaturan",
          i18nKey: "sidebar.section.pengaturan",
          items: [
            {
              title: "Metode Pembayaran",
              i18nKey: "sidebar.metodePembayaran",
              href: "/type-payment-list",
              icon: CreditCard
            },
            {
              title: "Invoice & Struk",
              i18nKey: "sidebar.invoiceStruk",
              href: "/invoice-page",
              icon: FileText
            },
            {
              title: "Backup & Restore",
              i18nKey: "sidebar.backup",
              href: "/backup",
              icon: Database
            }
          ]
        }
      ]
    }
  ]
};

// Terapkan sub-grup juga ke navCategories (dipakai NavigationModal)
[navCategories.super_admin, navCategories.admin].forEach((cats) => {
  (cats || []).forEach((cat) => {
    (cat.sections || []).forEach((section) => {
      const mapping = accessMenuSubGroups[section.i18nKey];
      if (!mapping || !Array.isArray(section.items)) return;
      section.items.forEach((item) => {
        if (mapping[item.href]) item.group = mapping[item.href];
      });
    });
  });
});

export const urlWithArrowBack = [
  { url: 0, title: "Dashboard", i18nKey: "sidebar.dashboardAdmin", pathName: "/dashboard-admin" },
  {
    url: 0,
    title: "Dashboard",
    i18nKey: "sidebar.dashboardSuperAdmin",
    pathName: "/dashboard-super-admin"
  },
  { url: -1, title: "Membership", i18nKey: "sidebar.membership", pathName: "/member-list" },
  {
    url: -1,
    title: "Type Payment",
    i18nKey: "sidebar.metodePembayaran",
    pathName: "/type-payment-list"
  },
  { url: -1, title: "Shift List", i18nKey: "sidebar.shift", pathName: "/shift-list" },
  { url: -1, title: "Discount", i18nKey: "sidebar.diskon", pathName: "/discount-list" },
  { url: -1, title: "Location", i18nKey: "sidebar.kelolaToko", pathName: "/location-list" },
  { url: -1, title: "Product", i18nKey: "sidebar.daftarProduk", pathName: "/product-list" },
  { url: -1, title: "Category", i18nKey: "sidebar.kategori", pathName: "/category-list" },
  { url: -1, title: "Employee", i18nKey: "sidebar.daftarKaryawan", pathName: "/employee-list" },
  { url: -1, title: "Table", i18nKey: "sidebar.meja", pathName: "/table-list" },
  { url: -1, title: "Member Tier", i18nKey: "sidebar.memberTier", pathName: "/member-tier" },
  { url: -1, title: "Supplier", i18nKey: "sidebar.supplier", pathName: "/supplier" },
  { url: -1, title: "Pajak", i18nKey: "sidebar.pajak", pathName: "/tax-list" },
  {
    url: -1,
    title: "Purchase Order",
    i18nKey: "sidebar.purchaseOrder",
    pathName: "/purchase-order"
  },
  {
    url: -1,
    title: "Goods Request",
    i18nKey: "sidebar.goodsRequest",
    pathName: "/goods-request"
  },
  {
    url: -1,
    title: "Dashboard Utang",
    i18nKey: "sidebar.apDashboard",
    pathName: "/ap-dashboard"
  },
  {
    url: -1,
    title: "Riwayat Pembayaran",
    i18nKey: "sidebar.purchasePayment",
    pathName: "/purchase-payment"
  },
  { url: -1, title: "Stock Opname", i18nKey: "sidebar.stockOpname", pathName: "/stock-opname" },
  {
    url: -1,
    title: "Production Order",
    i18nKey: "sidebar.productionOrder",
    pathName: "/production-order"
  },
  { url: -1, title: "Goods Receipt", i18nKey: "sidebar.goodsReceipt", pathName: "/goods-receipt" },
  { url: -1, title: "Stock History", i18nKey: "sidebar.historyStok", pathName: "/stock-history" },
  { url: -1, title: "Low Stock", i18nKey: "sidebar.lowStock", pathName: "/low-stock" },
  {
    url: -1,
    title: "Expense Category",
    i18nKey: "sidebar.kategoriPengeluaran",
    pathName: "/expense-category"
  },
  { url: -1, title: "Expense", i18nKey: "sidebar.daftarPengeluaran", pathName: "/expense" },
  { url: -1, title: "Accounting", i18nKey: "sidebar.accounting", pathName: "/accounting" },
  { url: -1, title: "Sales Report", i18nKey: "sidebar.penjualan", pathName: "/report/sales" },
  { url: -1, title: "Best Selling", i18nKey: "sidebar.produkTerlaris", pathName: "/best-selling" },
  { url: -1, title: "Position", i18nKey: "sidebar.posisi", pathName: "/position-list" },
  {
    url: "/position-list",
    title: "Add Position",
    i18nKey: "breadcrumb.add",
    pathName: "/add-position"
  },
  {
    url: "/position-list",
    title: "Edit Position",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-position"
  },
  {
    url: "/position-list",
    title: "Detail Position",
    i18nKey: "breadcrumb.detail",
    pathName: "/detail-position"
  },
  { url: -1, title: "Department", i18nKey: "sidebar.departemen", pathName: "/department-list" },
  {
    url: "/department-list",
    title: "Add Department",
    i18nKey: "breadcrumb.add",
    pathName: "/add-department"
  },
  {
    url: "/department-list",
    title: "Edit Department",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-department"
  },
  {
    url: "/category-list",
    title: "Add Category",
    i18nKey: "breadcrumb.add",
    pathName: "/add-category"
  },
  {
    url: "/category-list",
    title: "Edit Category",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-category"
  },
  {
    url: "/product-list",
    title: "Add Product",
    i18nKey: "breadcrumb.add",
    pathName: "/add-product"
  },
  {
    url: "/product-list",
    title: "Edit Product",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-product"
  },
  {
    url: -1,
    title: "Manajemen Role & Izin",
    i18nKey: "breadcrumb.management",
    pathName: "/role-management"
  },
  { url: "/role-management", title: "Add Role", i18nKey: "breadcrumb.add", pathName: "/add-role" },
  {
    url: "/role-management",
    title: "Edit Role",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-role"
  },
  {
    url: "/role-management",
    title: "Detail Role",
    i18nKey: "breadcrumb.detail",
    pathName: "/detail-role"
  },
  { url: "/user-list", title: "Add Admin", i18nKey: "breadcrumb.add", pathName: "/add-user" },
  {
    url: "/location-list",
    title: "Add Location Store",
    i18nKey: "breadcrumb.add",
    pathName: "/add-location"
  },
  {
    url: "/location-list",
    title: "Edit Location Store",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-location"
  },
  {
    url: "/discount-list",
    title: "Add Discount",
    i18nKey: "breadcrumb.add",
    pathName: "/add-discount"
  },
  {
    url: "/discount-list",
    title: "Edit Discount",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-discount"
  },
  { url: "/shift-list", title: "Add Shift", i18nKey: "breadcrumb.add", pathName: "/add-shift" },
  { url: "/shift-list", title: "Edit Shift", i18nKey: "breadcrumb.edit", pathName: "/edit-shift" },
  {
    url: "/type-payment-list",
    title: "Add Type Payment",
    i18nKey: "breadcrumb.add",
    pathName: "/add-type-payment"
  },
  {
    url: "/type-payment-list",
    title: "Edit Type Payment",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-type-payment"
  },
  { url: "/table-list", title: "Add Table", i18nKey: "breadcrumb.add", pathName: "/add-table" },
  { url: "/table-list", title: "Edit Table", i18nKey: "breadcrumb.edit", pathName: "/edit-table" },
  {
    url: "/reservation",
    title: "Add Reservation",
    i18nKey: "breadcrumb.add",
    pathName: "/add-reservation"
  },
  {
    url: "/reservation",
    title: "Edit Reservation",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-reservation"
  },
  { url: "/supplier", title: "Add Supplier", i18nKey: "breadcrumb.add", pathName: "/add-supplier" },
  {
    url: "/supplier",
    title: "Edit Supplier",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-supplier"
  },
  {
    url: "/purchase-order",
    title: "Add Purchase Order",
    i18nKey: "breadcrumb.add",
    pathName: "/add-purchase-order"
  },
  {
    url: "/purchase-order",
    title: "Edit Purchase Order",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-purchase-order"
  },
  {
    url: "/goods-request",
    title: "Add Goods Request",
    i18nKey: "breadcrumb.add",
    pathName: "/add-goods-request"
  },
  {
    url: "/goods-request",
    title: "Edit Goods Request",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-goods-request"
  },
  {
    url: "/goods-request",
    title: "Detail Goods Request",
    i18nKey: "breadcrumb.detail",
    pathName: "/goods-request/detail"
  },
  {
    url: "/stock-opname",
    title: "Add Stock Opname",
    i18nKey: "breadcrumb.add",
    pathName: "/add-stock-opname"
  },
  {
    url: "/production-order",
    title: "Add Production Order",
    i18nKey: "breadcrumb.add",
    pathName: "/add-production-order"
  },
  {
    url: "/production-order",
    title: "Detail Production Order",
    i18nKey: "breadcrumb.detail",
    pathName: "/production-order/detail"
  },
  {
    url: "/goods-receipt",
    title: "Add Goods Receipt",
    i18nKey: "breadcrumb.add",
    pathName: "/add-goods-receipt"
  },
  {
    url: "/goods-receipt",
    title: "Detail Goods Receipt",
    i18nKey: "breadcrumb.detail",
    pathName: "/goods-receipt/detail"
  },
  {
    url: "/goods-receipt",
    title: "Edit Goods Receipt",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-goods-receipt"
  },
  {
    url: "/expense-category",
    title: "Add Expense Category",
    i18nKey: "breadcrumb.add",
    pathName: "/add-expense-category"
  },
  {
    url: "/expense-category",
    title: "Edit Expense Category",
    i18nKey: "breadcrumb.edit",
    pathName: "/edit-expense-category"
  },
  { url: "/expense", title: "Add Expense", i18nKey: "breadcrumb.add", pathName: "/add-expense" },
  { url: "/expense", title: "Edit Expense", i18nKey: "breadcrumb.edit", pathName: "/edit-expense" },
  {
    url: "/member-tier",
    title: "Add Member Tier",
    i18nKey: "breadcrumb.add",
    pathName: "/add-member-tier"
  },
  { url: -1, title: "Sales Return", i18nKey: "sidebar.salesReturn", pathName: "/sales-return" },
  {
    url: "/sales-return",
    title: "Detail Sales Return",
    i18nKey: "breadcrumb.detail",
    pathName: "/sales-return/detail"
  },
  {
    url: -1,
    title: "Purchase Return",
    i18nKey: "sidebar.purchaseReturn",
    pathName: "/purchase-return"
  },
  {
    url: "/purchase-return",
    title: "Detail Purchase Return",
    i18nKey: "breadcrumb.detail",
    pathName: "/purchase-return/detail"
  },
  {
    url: -1,
    title: "Stock Transfer",
    i18nKey: "sidebar.stockTransfer",
    pathName: "/stock-transfer"
  },
  {
    url: "/stock-transfer",
    title: "Add Stock Transfer",
    i18nKey: "breadcrumb.add",
    pathName: "/add-stock-transfer"
  },
  {
    url: "/stock-transfer",
    title: "Detail Stock Transfer",
    i18nKey: "breadcrumb.detail",
    pathName: "/stock-transfer/detail"
  },
  {
    url: -1,
    title: "Kasir (Register)",
    i18nKey: "sidebar.cashRegister",
    pathName: "/cash-register/current"
  },
  {
    url: "/cash-register/current",
    title: "Riwayat Kasir",
    i18nKey: "breadcrumb.history",
    pathName: "/cash-register/history"
  },
  {
    url: "/cash-register/current",
    title: "Laporan X/Z",
    i18nKey: "sidebar.xzReport",
    pathName: "/cash-register/xz-report"
  },
  {
    url: -1,
    title: "Harga per Toko",
    i18nKey: "sidebar.pricePerStore",
    pathName: "/price-list-template"
  },
  { url: -1, title: "Backup & Restore", i18nKey: "sidebar.backup", pathName: "/backup" },
  { url: -1, title: "BOM", i18nKey: "sidebar.bom", pathName: "/bom" },
  {
    url: "/bom",
    title: "Add BOM",
    i18nKey: "breadcrumb.add",
    pathName: "/bom/add"
  },
  {
    url: "/bom",
    title: "Detail BOM",
    i18nKey: "breadcrumb.detail",
    pathName: "/bom/detail"
  },
  { url: -1, title: "Notification", i18nKey: "sidebar.notification", pathName: "/notification" },
  {
    url: -1,
    title: "Permintaan Pelayan",
    i18nKey: "sidebar.waiterRequest",
    pathName: "/waiter-request"
  },
  { url: -1, title: "Support", i18nKey: "sidebar.support", pathName: "/support" },
  { url: -1, title: "Profile", i18nKey: "sidebar.profile", pathName: "/profile" },
  { url: -1, title: "Backup & Restore", i18nKey: "sidebar.backup", pathName: "/backup" },
  {
    url: -1,
    title: "Stock Adjustment",
    i18nKey: "sidebar.stockAdjustment",
    pathName: "/stock-adjustment"
  },
  {
    url: -1,
    title: "Ingredient Category",
    i18nKey: "sidebar.ingredientCategory",
    pathName: "/ingredient-category"
  },
  { url: -1, title: "Laporan Harian", i18nKey: "sidebar.laporanHarian", pathName: "/report/daily" },
  { url: -1, title: "Arus Kas", i18nKey: "sidebar.arusKas", pathName: "/report/cash-flow" },
  {
    url: -1,
    title: "Store Geospatial",
    i18nKey: "sidebar.storeGeospatial",
    pathName: "/store-geospatial"
  }
];
