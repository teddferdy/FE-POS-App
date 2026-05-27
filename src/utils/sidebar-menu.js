import {
  Crown,
  Calculator,
  UtensilsCrossed,
  Users,
  BookUser,
  CalendarDays,
  Store,
  // Shield,
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
  Layers,
  ShoppingCart,
  TrendingUp,
  Receipt,
  LifeBuoy,
  ClipboardList,
  Award
} from "lucide-react";

export const sidebarMenuSuperAdmin = [
  {
    title: "Dashboard",
    href: "/dashboard-super-admin",
    icon: Crown,
    children: [],
    actions: ["view"]
  },
  {
    title: "Kelola Toko",
    href: "",
    icon: Store,
    children: [
      {
        title: "Daftar Toko",
        href: "/location-list",
        icon: Store,
        actions: ["add", "edit", "view", "delete", "import", "export"]
      }
    ],
    actions: []
  },
  {
    title: "Karyawan",
    href: "",
    icon: Users,
    children: [
      {
        title: "Departemen",
        href: "/department-list",
        icon: Building2,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Posisi",
        href: "/position-list",
        icon: FileText,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Kelola Karyawan",
        href: "",
        icon: Users,
        children: [
          {
            title: "Daftar Karyawan",
            href: "/employee-list",
            icon: Users,
            actions: ["add", "view", "edit-access", "reset-password"]
          }
        ],
        actions: []
      }
    ],
    actions: []
  },
  {
    title: "Produk",
    href: "",
    icon: Package,
    children: [
      {
        title: "Kategori",
        href: "/category-list",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Kelola Produk",
        href: "",
        icon: UtensilsCrossed,
        children: [
          {
            title: "Daftar Produk",
            href: "/product-list",
            icon: UtensilsCrossed,
            actions: ["add", "edit", "view", "delete", "import", "export"]
          }
        ],
        actions: []
      }
    ],
    actions: []
  },
  {
    title: "Kelola Pelanggan",
    href: "",
    icon: BookUser,
    children: [
      {
        title: "Daftar Member",
        href: "/member-list",
        icon: BookUser,
        actions: ["add", "edit", "view", "edit-points"]
      },
      {
        title: "Member Tier",
        href: "/member-tier",
        icon: Award,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Laporan Global",
    href: "",
    icon: BarChart3,
    children: [
      {
        title: "Penjualan",
        href: "/report/sales",
        icon: TrendingUp,
        actions: ["view", "export"]
      },
      {
        title: "Produk Terlaris",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view", "export"]
      }
    ],
    actions: []
  },
  {
    title: "Pengaturan Sistem",
    href: "",
    icon: Settings,
    children: [
      {
        title: "Pengaturan Global",
        href: "/global-setting",
        icon: Settings,
        actions: ["view", "edit"]
      }
    ],
    actions: []
  }
];

export const sidebarMenuAdmin = [
  {
    title: "Dashboard Toko",
    href: "/dashboard-admin",
    icon: Crown,
    actions: ["view"]
  },
  {
    title: "Produk",
    href: "",
    icon: Package,
    children: [
      {
        title: "Kategori",
        href: "",
        icon: Tag,
        children: [
          {
            title: "Daftar Kategori",
            href: "/category-list",
            icon: Tag,
            actions: ["add", "edit", "view", "delete"]
          },
          {
            title: "Sub Kategori",
            href: "/sub-category-list",
            icon: Layers,
            actions: ["add", "edit", "view", "delete"]
          }
        ],
        actions: []
      },
      {
        title: "Kelola Produk",
        href: "",
        icon: UtensilsCrossed,
        children: [
          {
            title: "Daftar Produk",
            href: "/product-list",
            icon: UtensilsCrossed,
            actions: ["add", "edit", "view", "delete", "import", "export"]
          }
        ],
        actions: []
      }
    ],
    actions: []
  },
  {
    title: "Kelola Meja",
    href: "",
    icon: Table,
    children: [
      {
        title: "Daftar Meja",
        href: "/table-list",
        icon: Table,
        actions: ["add", "edit", "view", "delete", "update-status"]
      }
    ],
    actions: []
  },
  {
    title: "Karyawan",
    href: "",
    icon: Users,
    children: [
      {
        title: "Departemen",
        href: "/department-list",
        icon: Building2,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Posisi",
        href: "/position-list",
        icon: FileText,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Kelola Karyawan",
        href: "",
        icon: Users,
        children: [
          {
            title: "Daftar Karyawan",
            href: "/user-list",
            icon: Users,
            actions: ["add", "edit", "view", "edit-access"]
          }
        ],
        actions: []
      }
    ],
    actions: []
  },
  {
    title: "Kelola Pelanggan",
    href: "",
    icon: BookUser,
    children: [
      {
        title: "Daftar Member",
        href: "/member-list",
        icon: BookUser,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Tier / Level",
        href: "/member-tier",
        icon: TrendingUp,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Kelola Diskon",
    href: "",
    icon: Percent,
    children: [
      {
        title: "Daftar Diskon",
        href: "/discount-list",
        icon: ShoppingCart,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Metode Pembayaran",
    href: "",
    icon: CreditCard,
    children: [
      {
        title: "Daftar Pembayaran",
        href: "/type-payment-list",
        icon: CreditCard,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Shift Management",
    href: "",
    icon: CalendarDays,
    children: [
      {
        title: "Daftar Shift",
        href: "/shift-list",
        icon: CalendarDays,
        actions: ["add", "edit", "view", "delete"]
      }
    ],
    actions: []
  },
  {
    title: "Laporan Toko",
    href: "",
    icon: BarChart3,
    children: [
      {
        title: "Penjualan Harian",
        href: "/report/sales",
        icon: TrendingUp,
        actions: ["view", "export"]
      },
      {
        title: "Best Selling",
        href: "/best-selling",
        icon: BarChart3,
        actions: ["view", "export"]
      }
    ],
    actions: []
  },
  {
    title: "Inventory",
    href: "",
    icon: Warehouse,
    children: [
      {
        title: "Supplier",
        href: "/supplier",
        icon: LifeBuoy,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Purchase Order",
        href: "/purchase-order",
        icon: ShoppingCart,
        actions: ["add", "edit", "view"]
      },
      {
        title: "Stock Opname",
        href: "/stock-opname",
        icon: ClipboardList,
        actions: ["add", "view"]
      },
      {
        title: "History Stok",
        href: "/stock-history",
        icon: FileText,
        actions: ["view"]
      }
    ],
    actions: []
  },
  {
    title: "Pengeluaran",
    href: "",
    icon: Receipt,
    children: [
      {
        title: "Kategori Pengeluaran",
        href: "/expense-category",
        icon: Tag,
        actions: ["add", "edit", "view", "delete"]
      },
      {
        title: "Daftar Pengeluaran",
        href: "/expense",
        icon: Receipt,
        actions: ["add", "edit", "view", "approve"]
      }
    ],
    actions: []
  },
  {
    title: "Pengaturan Toko",
    href: "",
    icon: Settings,
    children: [
      {
        title: "Invoice & Struk",
        href: "/invoice-page",
        icon: FileText,
        actions: ["add", "edit", "view"]
      }
    ],
    actions: []
  }
];

export const sidebarMenuUser = [
  {
    title: "Cashier",
    href: "/home",
    icon: Calculator,
    actions: ["add", "view"]
  },
  {
    title: "Membership",
    href: "/member-list",
    icon: BookUser,
    actions: ["view"]
  },
  {
    title: "My Shift (Coming Soon)",
    href: "#",
    icon: CalendarDays,
    actions: ["view"]
  }
];

// ARROW BACK
export const urlWithArrowBack = [
  {
    url: 0,
    title: "Dashboard",
    pathName: "/dashboard-admin"
  },
  {
    url: 0,
    title: "Dashboard",
    pathName: "/dashboard-super-admin"
  },

  // List Pages
  {
    url: -1,
    title: "Membership",
    pathName: "/member-list"
  },
  {
    url: -1,
    title: "Social Media",
    pathName: "/social-media-list"
  },
  {
    url: -1,
    title: "Type Payment",
    pathName: "/type-payment-list"
  },
  {
    url: -1,
    title: "Shift List",
    pathName: "/shift-list"
  },
  {
    url: -1,
    title: "Discount",
    pathName: "/discount-list"
  },
  {
    url: -1,
    title: "Location",
    pathName: "/location-list"
  },
  {
    url: -1,
    title: "Social Media Invoice",
    pathName: "/social-media-invoice-list"
  },
  {
    url: -1,
    title: "Footer Invoice",
    pathName: "/footer-invoice-list"
  },
  {
    url: -1,
    title: "Logo Invoice",
    pathName: "/logo-invoice-list"
  },
  {
    url: -1,
    title: "Product Page",
    pathName: "/product-page"
  },
  {
    url: -1,
    title: "Product",
    pathName: "/product-list"
  },
  {
    url: -1,
    title: "Sub Category",
    pathName: "/sub-category-list"
  },
  {
    url: -1,
    title: "Category",
    pathName: "/category-list"
  },
  {
    url: -1,
    title: "Employee",
    pathName: "/employee-list"
  },
  {
    url: -1,
    title: "Table",
    pathName: "/table-list"
  },
  {
    url: -1,
    title: "Member Tier",
    pathName: "/member-tier"
  },
  {
    url: -1,
    title: "Supplier",
    pathName: "/supplier"
  },
  {
    url: -1,
    title: "Purchase Order",
    pathName: "/purchase-order"
  },
  {
    url: -1,
    title: "Stock Opname",
    pathName: "/stock-opname"
  },
  {
    url: -1,
    title: "Stock History",
    pathName: "/stock-history"
  },
  {
    url: -1,
    title: "Expense Category",
    pathName: "/expense-category"
  },
  {
    url: -1,
    title: "Expense",
    pathName: "/expense"
  },
  {
    url: -1,
    title: "Sales Report",
    pathName: "/report/sales"
  },
  {
    url: -1,
    title: "Best Selling",
    pathName: "/best-selling"
  },
  {
    url: -1,
    title: "Role",
    pathName: "/role-list"
  },
  {
    url: -1,
    title: "Position",
    pathName: "/position-list"
  },
  {
    url: "/position-list",
    title: "Add Position",
    pathName: "/add-position"
  },
  {
    url: "/position-list",
    title: "Edit Position",
    pathName: "/edit-position"
  },
  {
    url: "/position-list",
    title: "Detail Position",
    pathName: "/detail-position"
  },
  {
    url: -1,
    title: "Department",
    pathName: "/department-list"
  },
  {
    url: "/department-list",
    title: "Add Department",
    pathName: "/add-department"
  },
  {
    url: "/department-list",
    title: "Edit Department",
    pathName: "/edit-department"
  },

  // Form Pages - Category
  {
    url: "/category-list",
    title: "Add Category",
    pathName: "/add-category"
  },
  {
    url: "/category-list",
    title: "Edit Category",
    pathName: "/edit-category"
  },

  // Form Pages - Sub Category
  {
    url: "/sub-category-list",
    title: "Add Sub Category",
    pathName: "/add-sub-category"
  },
  {
    url: "/sub-category-list",
    title: "Edit Sub Category",
    pathName: "/edit-sub-category"
  },

  // Form Pages - Product
  {
    url: "/product-list",
    title: "Add Product",
    pathName: "/add-product"
  },
  {
    url: "/product-list",
    title: "Edit Product",
    pathName: "/edit-product"
  },

  // Form Pages - Invoice Logo
  {
    url: "/logo-invoice-list",
    title: "Add Invoice Logo",
    pathName: "/add-invoice-logo"
  },
  {
    url: "/logo-invoice-list",
    title: "Edit Invoice Logo",
    pathName: "/edit-invoice-logo"
  },

  // Form Pages - Invoice Footer
  {
    url: "/footer-invoice-list",
    title: "Add Invoice Footer",
    pathName: "/add-invoice-footer"
  },
  {
    url: "/footer-invoice-list",
    title: "Edit Invoice Footer",
    pathName: "/edit-invoice-footer"
  },

  // Form Pages - Invoice Social Media
  {
    url: "/social-media-invoice-list",
    title: "Add Invoice Social Media",
    pathName: "/add-invoice-social-media"
  },
  {
    url: "/social-media-invoice-list",
    title: "Edit Invoice Social Media",
    pathName: "/edit-invoice-social-media"
  },

  {
    url: -1,
    title: "Manajemen Role & Izin",
    pathName: "/role-management"
  },
  {
    url: "/role-management",
    title: "Add Role",
    pathName: "/add-role"
  },

  // Form Pages - User
  {
    url: "/user-list",
    title: "Add Admin",
    pathName: "/add-user"
  },

  // Form Pages - Location
  {
    url: "/location-list",
    title: "Add Location Store",
    pathName: "/add-location"
  },
  {
    url: "/location-list",
    title: "Edit Location Store",
    pathName: "/edit-location"
  },

  // Form Pages - Discount
  {
    url: "/discount-list",
    title: "Add Discount",
    pathName: "/add-discount"
  },
  {
    url: "/discount-list",
    title: "Edit Discount",
    pathName: "/edit-discount"
  },

  // Form Pages - Shift
  {
    url: "/shift-list",
    title: "Add Shift",
    pathName: "/add-shift"
  },
  {
    url: "/shift-list",
    title: "Edit Shift",
    pathName: "/edit-shift"
  },

  // Form Pages - Type Payment
  {
    url: "/type-payment-list",
    title: "Add Type Payment",
    pathName: "/add-type-payment"
  },
  {
    url: "/type-payment-list",
    title: "Edit Type Payment",
    pathName: "/edit-type-payment"
  },

  // Form Pages - Social Media
  {
    url: "/social-media-list",
    title: "Add Social Media",
    pathName: "/add-social-media"
  },
  {
    url: "/social-media-list",
    title: "Edit Social Media",
    pathName: "/edit-social-media"
  },

  // Form Pages - Table
  {
    url: "/table-list",
    title: "Add Table",
    pathName: "/add-table"
  },
  {
    url: "/table-list",
    title: "Edit Table",
    pathName: "/edit-table"
  },

  // Form Pages - Supplier
  {
    url: "/supplier",
    title: "Add Supplier",
    pathName: "/add-supplier"
  },
  {
    url: "/supplier",
    title: "Edit Supplier",
    pathName: "/edit-supplier"
  },

  // Form Pages - Purchase Order
  {
    url: "/purchase-order",
    title: "Add Purchase Order",
    pathName: "/add-purchase-order"
  },

  // Form Pages - Stock Opname
  {
    url: "/stock-opname",
    title: "Add Stock Opname",
    pathName: "/add-stock-opname"
  },

  // Form Pages - Expense Category
  {
    url: "/expense-category",
    title: "Add Expense Category",
    pathName: "/add-expense-category"
  },
  {
    url: "/expense-category",
    title: "Edit Expense Category",
    pathName: "/edit-expense-category"
  },

  // Form Pages - Expense
  {
    url: "/expense",
    title: "Add Expense",
    pathName: "/add-expense"
  },
  {
    url: "/expense",
    title: "Edit Expense",
    pathName: "/edit-expense"
  },

  // Form Pages - Member Tier
  {
    url: "/member-tier",
    title: "Add Member Tier",
    pathName: "/add-member-tier"
  },
  {
    url: "/member-tier",
    title: "Edit Member Tier",
    pathName: "/edit-member-tier"
  }
];
