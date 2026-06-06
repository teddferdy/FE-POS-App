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
  Shield
} from "lucide-react";

export const sidebarMenuSuperAdmin = [
  {
    title: "Dashboard",
    i18nKey: "sidebar.dashboardSuperAdmin",
    href: "/dashboard-super-admin",
    icon: Crown,
    children: [],
    actions: ["view"]
  },
  {
    title: "Kelola Toko",
    i18nKey: "sidebar.kelolaToko",
    href: "/location-list",
    icon: Store,
    children: [],
    actions: ["add", "edit", "view", "delete", "import", "export"]
  },
  {
    title: "Produk",
    i18nKey: "sidebar.produk",
    href: "",
    icon: Package,
    children: [
      {
        title: "Kategori",
        i18nKey: "sidebar.kategori",
        href: "/category-list",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Supplier",
        i18nKey: "sidebar.supplier",
        href: "/supplier",
        icon: Building2,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Produk",
        i18nKey: "sidebar.daftarProduk",
        href: "/product-list",
        icon: UtensilsCrossed,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      }
    ],
    actions: []
  },
  {
    title: "Pelanggan",
    i18nKey: "sidebar.pelanggan",
    href: "",
    icon: BookUser,
    children: [
      {
        title: "Daftar Member",
        i18nKey: "sidebar.daftarMember",
        href: "/member-list",
        icon: BookUser,
        actions: ["add", "edit", "view", "edit-points"]
      },
      {
        title: "Member Tier",
        i18nKey: "sidebar.memberTier",
        href: "/member-tier",
        icon: Award,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Manajemen Stok",
    i18nKey: "sidebar.manajemenStok",
    href: "",
    icon: ClipboardList,
    children: [
      {
        title: "Stock Opname",
        i18nKey: "sidebar.stockOpname",
        href: "/stock-opname",
        icon: ClipboardList,
        actions: ["add", "view"]
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
      }
    ],
    actions: []
  },
  {
    title: "Karyawan",
    i18nKey: "sidebar.karyawan",
    href: "",
    icon: Users,
    children: [
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
      }
    ],
    actions: []
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
        actions: ["view", "export"]
      },
      {
        title: "Produk Terlaris",
        i18nKey: "sidebar.produkTerlaris",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view", "export"]
      }
    ],
    actions: []
  },
  {
    title: "Pengaturan",
    i18nKey: "sidebar.pengaturan",
    href: "",
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
        title: "Template Harga",
        i18nKey: "sidebar.templateHarga",
        href: "/price-list-template",
        icon: TrendingUp,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Manajemen Role & Izin",
        i18nKey: "sidebar.roleManagement",
        href: "/role-management",
        icon: Shield,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  }
];

export const sidebarMenuAdmin = [
  {
    title: "Dashboard Toko",
    i18nKey: "sidebar.dashboardAdmin",
    href: "/dashboard-admin",
    icon: Crown,
    actions: ["view"]
  },
  {
    title: "Produk",
    i18nKey: "sidebar.produk",
    href: "",
    icon: Package,
    children: [
      {
        title: "Daftar Produk",
        i18nKey: "sidebar.daftarProduk",
        href: "/product-list",
        icon: UtensilsCrossed,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      },
      {
        title: "Kategori",
        i18nKey: "sidebar.kategori",
        href: "/category-list",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Supplier",
        i18nKey: "sidebar.supplier",
        href: "/supplier",
        icon: Building2,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Pelanggan",
    i18nKey: "sidebar.pelanggan",
    href: "",
    icon: BookUser,
    children: [
      {
        title: "Daftar Member",
        i18nKey: "sidebar.daftarMember",
        href: "/member-list",
        icon: BookUser,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Tier / Level",
        i18nKey: "sidebar.memberTier",
        href: "/member-tier",
        icon: TrendingUp,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Transaksi",
    i18nKey: "sidebar.transaksi",
    href: "",
    icon: CreditCard,
    children: [
      {
        title: "Diskon",
        i18nKey: "sidebar.diskon",
        href: "/discount-list",
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
        title: "Shift",
        i18nKey: "sidebar.shift",
        href: "/shift-list",
        icon: CalendarDays,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Inventory",
    i18nKey: "sidebar.inventory",
    href: "",
    icon: Warehouse,
    children: [
      {
        title: "Purchase Order",
        i18nKey: "sidebar.purchaseOrder",
        href: "/purchase-order",
        icon: ShoppingCart,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Stock Opname",
        i18nKey: "sidebar.stockOpname",
        href: "/stock-opname",
        icon: ClipboardList,
        actions: ["add", "view"]
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
      }
    ],
    actions: []
  },
  {
    title: "Pengeluaran",
    i18nKey: "sidebar.pengeluaran",
    href: "",
    icon: Receipt,
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
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
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
        actions: ["view", "export"]
      },
      {
        title: "Best Selling",
        i18nKey: "sidebar.produkTerlaris",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view", "export"]
      }
    ],
    actions: []
  },
  {
    title: "Karyawan",
    i18nKey: "sidebar.karyawan",
    href: "",
    icon: Users,
    children: [
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
      }
    ],
    actions: []
  },
  {
    title: "Pengaturan",
    i18nKey: "sidebar.pengaturan",
    href: "",
    icon: Settings,
    children: [
      {
        title: "Meja",
        i18nKey: "sidebar.meja",
        href: "/table-list",
        icon: Table,
        actions: ["add", "edit", "view", "delete", "update-status"]
      },
      {
        title: "Template Harga",
        i18nKey: "sidebar.templateHarga",
        href: "/price-list-template",
        icon: TrendingUp,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Invoice & Struk",
        i18nKey: "sidebar.invoiceStruk",
        href: "/invoice-page",
        icon: FileText,
        actions: ["add", "edit", "view"]
      }
    ],
    actions: []
  }
];

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
  },
  {
    title: "My Shift (Coming Soon)",
    i18nKey: "sidebar.myShift",
    href: "#",
    icon: CalendarDays,
    actions: ["view"]
  }
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

// ARROW BACK
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
  { url: -1, title: "Stock Opname", i18nKey: "sidebar.stockOpname", pathName: "/stock-opname" },
  { url: -1, title: "Stock History", i18nKey: "sidebar.historyStok", pathName: "/stock-history" },
  { url: -1, title: "Low Stock", i18nKey: "sidebar.lowStock", pathName: "/low-stock" },
  {
    url: -1,
    title: "Expense Category",
    i18nKey: "sidebar.kategoriPengeluaran",
    pathName: "/expense-category"
  },
  { url: -1, title: "Expense", i18nKey: "sidebar.daftarPengeluaran", pathName: "/expense" },
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
    url: "/stock-opname",
    title: "Add Stock Opname",
    i18nKey: "breadcrumb.add",
    pathName: "/add-stock-opname"
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
  }
];
