import {
  Rocket,
  Search,
  Languages,
  Sun,
  LifeBuoy,
  Bell,
  User,
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Store,
  FolderTree,
  Truck,
  Package,
  Award,
  Users,
  BarChart3,
  List,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Briefcase,
  Network,
  Settings,
  Image,
  MapPin,
  FileText,
  Save,
  Eye,
  Percent,
  Tag,
  Shield,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  BookOpen
} from "lucide-react";

export const superAdminSteps = [
  // ── Header (always visible from any page) ──
  {
    id: "welcome",
    page: null,
    icon: Rocket,
    titleKey: "guide.dashboard.s1",
    descKey: "guide.dashboard.s1desc",
    actionKey: "guide.dashboard.start"
  },
  {
    id: "header-search",
    page: null,
    target: '[data-tour="header-search"]',
    icon: Search,
    titleKey: "guide.dashboard.s2",
    descKey: "guide.dashboard.s2desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "header-translation",
    page: null,
    target: '[data-tour="header-translation"]',
    icon: Languages,
    titleKey: "guide.dashboard.s3",
    descKey: "guide.dashboard.s3desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "header-theme",
    page: null,
    target: '[data-tour="header-theme"]',
    icon: Sun,
    titleKey: "guide.dashboard.s4",
    descKey: "guide.dashboard.s4desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "header-tour",
    page: null,
    target: '[data-tour="header-tour"]',
    icon: LifeBuoy,
    titleKey: "guide.dashboard.s5",
    descKey: "guide.dashboard.s5desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "header-notification",
    page: null,
    target: '[data-tour="header-notification"]',
    icon: Bell,
    titleKey: "guide.dashboard.s6",
    descKey: "guide.dashboard.s6desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "header-user",
    page: null,
    target: '[data-tour="header-user"]',
    icon: User,
    titleKey: "guide.dashboard.s7",
    descKey: "guide.dashboard.s7desc",
    actionKey: "guide.dashboard.next"
  },

  // ── Dashboard ──
  {
    id: "dashboard-stats",
    page: "/dashboard-super-admin",
    target: '[data-tour="dashboard-stats"]',
    icon: LayoutDashboard,
    titleKey: "guide.dashboard.s8",
    descKey: "guide.dashboard.s8desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "dashboard-chart",
    page: "/dashboard-super-admin",
    target: '[data-tour="dashboard-chart"]',
    icon: TrendingUp,
    titleKey: "guide.dashboard.s9",
    descKey: "guide.dashboard.s9desc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "dashboard-orders",
    page: "/dashboard-super-admin",
    target: '[data-tour="dashboard-orders"]',
    icon: ShoppingCart,
    titleKey: "guide.dashboard.s10",
    descKey: "guide.dashboard.s10desc",
    actionKey: "guide.dashboard.next"
  },

  // ── Kelola Toko ──
  {
    id: "location-intro",
    page: "/location-list",
    icon: Store,
    titleKey: "guide.location.s11a",
    descKey: "guide.location.s11adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "location-stat-total",
    page: "/location-list",
    target: '[data-tour="location-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.location.s11b",
    descKey: "guide.location.s11bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "location-stat-active",
    page: "/location-list",
    target: '[data-tour="location-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.location.s11c",
    descKey: "guide.location.s11cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "location-stat-inactive",
    page: "/location-list",
    target: '[data-tour="location-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.location.s11d",
    descKey: "guide.location.s11ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "location-stat-cities",
    page: "/location-list",
    target: '[data-tour="location-stat-cities"]',
    icon: BarChart3,
    titleKey: "guide.location.s11e",
    descKey: "guide.location.s11edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "location-add",
    page: "/location-list",
    target: '[data-tour="location-add"]',
    icon: Plus,
    titleKey: "guide.location.s11f",
    descKey: "guide.location.s11fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "location-table",
    page: "/location-list",
    target: '[data-tour="location-table"]',
    icon: List,
    titleKey: "guide.location.s11g",
    descKey: "guide.location.s11gdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Kategori ──
  {
    id: "category-intro",
    page: "/category-list",
    icon: FolderTree,
    titleKey: "guide.category.s12a",
    descKey: "guide.category.s12adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-stat-total",
    page: "/category-list",
    target: '[data-tour="category-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.category.s12b",
    descKey: "guide.category.s12bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-stat-active",
    page: "/category-list",
    target: '[data-tour="category-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.category.s12c",
    descKey: "guide.category.s12cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-stat-inactive",
    page: "/category-list",
    target: '[data-tour="category-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.category.s12d",
    descKey: "guide.category.s12ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-download-template",
    page: "/category-list",
    target: '[data-tour="category-download-template"]',
    icon: Download,
    titleKey: "guide.category.s12e",
    descKey: "guide.category.s12edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-download-data",
    page: "/category-list",
    target: '[data-tour="category-download-data"]',
    icon: Download,
    titleKey: "guide.category.s12f",
    descKey: "guide.category.s12fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-upload",
    page: "/category-list",
    target: '[data-tour="category-upload"]',
    icon: Upload,
    titleKey: "guide.category.s12g",
    descKey: "guide.category.s12gdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-add",
    page: "/category-list",
    target: '[data-tour="category-add"]',
    icon: Plus,
    titleKey: "guide.category.s12h",
    descKey: "guide.category.s12hdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "category-table",
    page: "/category-list",
    target: '[data-tour="category-table"]',
    icon: List,
    titleKey: "guide.category.s12i",
    descKey: "guide.category.s12idesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Supplier ──
  {
    id: "supplier-intro",
    page: "/supplier",
    icon: Truck,
    titleKey: "guide.supplier.s13a",
    descKey: "guide.supplier.s13adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "supplier-stat-total",
    page: "/supplier",
    target: '[data-tour="supplier-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.supplier.s13b",
    descKey: "guide.supplier.s13bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "supplier-stat-active",
    page: "/supplier",
    target: '[data-tour="supplier-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.supplier.s13c",
    descKey: "guide.supplier.s13cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "supplier-stat-inactive",
    page: "/supplier",
    target: '[data-tour="supplier-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.supplier.s13d",
    descKey: "guide.supplier.s13ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "supplier-add",
    page: "/supplier",
    target: '[data-tour="supplier-add"]',
    icon: Plus,
    titleKey: "guide.supplier.s13e",
    descKey: "guide.supplier.s13edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "supplier-search",
    page: "/supplier",
    target: '[data-tour="supplier-search"]',
    icon: Search,
    titleKey: "guide.supplier.s13f",
    descKey: "guide.supplier.s13fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "supplier-table",
    page: "/supplier",
    target: '[data-tour="supplier-table"]',
    icon: List,
    titleKey: "guide.supplier.s13g",
    descKey: "guide.supplier.s13gdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Produk ──
  {
    id: "product-intro",
    page: "/product-list",
    icon: Package,
    titleKey: "guide.product.s14a",
    descKey: "guide.product.s14adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "product-import",
    page: "/product-list",
    target: '[data-tour="product-import"]',
    icon: Upload,
    titleKey: "guide.product.s14b",
    descKey: "guide.product.s14bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "product-export",
    page: "/product-list",
    target: '[data-tour="product-export"]',
    icon: Download,
    titleKey: "guide.product.s14c",
    descKey: "guide.product.s14cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "product-add",
    page: "/product-list",
    target: '[data-tour="product-add"]',
    icon: Plus,
    titleKey: "guide.product.s14d",
    descKey: "guide.product.s14ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "product-search",
    page: "/product-list",
    target: '[data-tour="product-search"]',
    icon: Search,
    titleKey: "guide.product.s14e",
    descKey: "guide.product.s14edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "product-table",
    page: "/product-list",
    target: '[data-tour="product-table"]',
    icon: List,
    titleKey: "guide.product.s14f",
    descKey: "guide.product.s14fdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Member ──
  {
    id: "member-intro",
    page: "/member-list",
    icon: Award,
    titleKey: "guide.member.s15a",
    descKey: "guide.member.s15adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "member-add",
    page: "/member-list",
    target: '[data-tour="member-add"]',
    icon: Plus,
    titleKey: "guide.member.s15b",
    descKey: "guide.member.s15bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "member-search",
    page: "/member-list",
    target: '[data-tour="member-search"]',
    icon: Search,
    titleKey: "guide.member.s15c",
    descKey: "guide.member.s15cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "member-table",
    page: "/member-list",
    target: '[data-tour="member-table"]',
    icon: List,
    titleKey: "guide.member.s15d",
    descKey: "guide.member.s15ddesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Karyawan ──
  {
    id: "employee-intro",
    page: "/employee-list",
    icon: Users,
    titleKey: "guide.employee.s16a",
    descKey: "guide.employee.s16adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "employee-stat-total",
    page: "/employee-list",
    target: '[data-tour="employee-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.employee.s16b",
    descKey: "guide.employee.s16bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "employee-stat-active",
    page: "/employee-list",
    target: '[data-tour="employee-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.employee.s16c",
    descKey: "guide.employee.s16cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "employee-stat-inactive",
    page: "/employee-list",
    target: '[data-tour="employee-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.employee.s16d",
    descKey: "guide.employee.s16ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "employee-add",
    page: "/employee-list",
    target: '[data-tour="employee-add"]',
    icon: Plus,
    titleKey: "guide.employee.s16e",
    descKey: "guide.employee.s16edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "employee-table",
    page: "/employee-list",
    target: '[data-tour="employee-table"]',
    icon: List,
    titleKey: "guide.employee.s16f",
    descKey: "guide.employee.s16fdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Departemen ──
  {
    id: "department-intro",
    page: "/department-list",
    icon: Network,
    titleKey: "guide.department.s17a",
    descKey: "guide.department.s17adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-stat-total",
    page: "/department-list",
    target: '[data-tour="department-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.department.s17b",
    descKey: "guide.department.s17bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-stat-active",
    page: "/department-list",
    target: '[data-tour="department-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.department.s17c",
    descKey: "guide.department.s17cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-stat-inactive",
    page: "/department-list",
    target: '[data-tour="department-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.department.s17d",
    descKey: "guide.department.s17ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-stat-nodesc",
    page: "/department-list",
    target: '[data-tour="department-stat-nodesc"]',
    icon: BarChart3,
    titleKey: "guide.department.s17e",
    descKey: "guide.department.s17edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-download-template",
    page: "/department-list",
    target: '[data-tour="department-download-template"]',
    icon: Download,
    titleKey: "guide.department.s17f",
    descKey: "guide.department.s17fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-download-data",
    page: "/department-list",
    target: '[data-tour="department-download-data"]',
    icon: Download,
    titleKey: "guide.department.s17g",
    descKey: "guide.department.s17gdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-upload",
    page: "/department-list",
    target: '[data-tour="department-upload"]',
    icon: Upload,
    titleKey: "guide.department.s17h",
    descKey: "guide.department.s17hdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-add",
    page: "/department-list",
    target: '[data-tour="department-add"]',
    icon: Plus,
    titleKey: "guide.department.s17i",
    descKey: "guide.department.s17idesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-search",
    page: "/department-list",
    target: '[data-tour="department-search"]',
    icon: Search,
    titleKey: "guide.department.s17j",
    descKey: "guide.department.s17jdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "department-table",
    page: "/department-list",
    target: '[data-tour="department-table"]',
    icon: List,
    titleKey: "guide.department.s17k",
    descKey: "guide.department.s17kdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Posisi ──
  {
    id: "position-intro",
    page: "/position-list",
    icon: Briefcase,
    titleKey: "guide.position.s18a",
    descKey: "guide.position.s18adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-stat-total",
    page: "/position-list",
    target: '[data-tour="position-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.position.s18b",
    descKey: "guide.position.s18bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-stat-active",
    page: "/position-list",
    target: '[data-tour="position-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.position.s18c",
    descKey: "guide.position.s18cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-stat-inactive",
    page: "/position-list",
    target: '[data-tour="position-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.position.s18d",
    descKey: "guide.position.s18ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-download-template",
    page: "/position-list",
    target: '[data-tour="position-download-template"]',
    icon: Download,
    titleKey: "guide.position.s18e",
    descKey: "guide.position.s18edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-download-data",
    page: "/position-list",
    target: '[data-tour="position-download-data"]',
    icon: Download,
    titleKey: "guide.position.s18f",
    descKey: "guide.position.s18fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-upload",
    page: "/position-list",
    target: '[data-tour="position-upload"]',
    icon: Upload,
    titleKey: "guide.position.s18g",
    descKey: "guide.position.s18gdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-add",
    page: "/position-list",
    target: '[data-tour="position-add"]',
    icon: Plus,
    titleKey: "guide.position.s18h",
    descKey: "guide.position.s18hdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-search",
    page: "/position-list",
    target: '[data-tour="position-search"]',
    icon: Search,
    titleKey: "guide.position.s18i",
    descKey: "guide.position.s18idesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "position-table",
    page: "/position-list",
    target: '[data-tour="position-table"]',
    icon: List,
    titleKey: "guide.position.s18j",
    descKey: "guide.position.s18jdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Pengaturan Invoice ──
  {
    id: "settings-intro",
    page: "/invoice-page",
    icon: Settings,
    titleKey: "guide.settings.s19a",
    descKey: "guide.settings.s19adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "settings-logo",
    page: "/invoice-page",
    target: '[data-tour="invoice-logo"]',
    icon: Image,
    titleKey: "guide.settings.s19b",
    descKey: "guide.settings.s19bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "settings-address",
    page: "/invoice-page",
    target: '[data-tour="invoice-address"]',
    icon: MapPin,
    titleKey: "guide.settings.s19c",
    descKey: "guide.settings.s19cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "settings-footer",
    page: "/invoice-page",
    target: '[data-tour="invoice-footer"]',
    icon: FileText,
    titleKey: "guide.settings.s19d",
    descKey: "guide.settings.s19ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "settings-save",
    page: "/invoice-page",
    target: '[data-tour="invoice-save"]',
    icon: Save,
    titleKey: "guide.settings.s19e",
    descKey: "guide.settings.s19edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "settings-preview",
    page: "/invoice-page",
    target: '[data-tour="invoice-preview"]',
    icon: Eye,
    titleKey: "guide.settings.s19f",
    descKey: "guide.settings.s19fdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Pajak (Tax Config) ──
  {
    id: "tax-intro",
    page: "/tax-list",
    icon: Percent,
    titleKey: "guide.tax.s20a",
    descKey: "guide.tax.s20adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tax-stat-total",
    page: "/tax-list",
    target: '[data-tour="tax-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.tax.s20b",
    descKey: "guide.tax.s20bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tax-stat-active",
    page: "/tax-list",
    target: '[data-tour="tax-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.tax.s20c",
    descKey: "guide.tax.s20cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tax-stat-inactive",
    page: "/tax-list",
    target: '[data-tour="tax-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.tax.s20d",
    descKey: "guide.tax.s20ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tax-add",
    page: "/tax-list",
    target: '[data-tour="tax-add"]',
    icon: Plus,
    titleKey: "guide.tax.s20e",
    descKey: "guide.tax.s20edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tax-search",
    page: "/tax-list",
    target: '[data-tour="tax-search"]',
    icon: Search,
    titleKey: "guide.tax.s20f",
    descKey: "guide.tax.s20fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tax-table",
    page: "/tax-list",
    target: '[data-tour="tax-table"]',
    icon: List,
    titleKey: "guide.tax.s20g",
    descKey: "guide.tax.s20gdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Template Harga (Price List Template) ──
  {
    id: "pricelist-intro",
    page: "/price-list-template",
    icon: Tag,
    titleKey: "guide.pricelist.s21a",
    descKey: "guide.pricelist.s21adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "pricelist-stat-total",
    page: "/price-list-template",
    target: '[data-tour="pricelist-stat-total"]',
    icon: BarChart3,
    titleKey: "guide.pricelist.s21b",
    descKey: "guide.pricelist.s21bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "pricelist-stat-active",
    page: "/price-list-template",
    target: '[data-tour="pricelist-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.pricelist.s21c",
    descKey: "guide.pricelist.s21cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "pricelist-stat-inactive",
    page: "/price-list-template",
    target: '[data-tour="pricelist-stat-inactive"]',
    icon: BarChart3,
    titleKey: "guide.pricelist.s21d",
    descKey: "guide.pricelist.s21ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "pricelist-add",
    page: "/price-list-template",
    target: '[data-tour="pricelist-add"]',
    icon: Plus,
    titleKey: "guide.pricelist.s21e",
    descKey: "guide.pricelist.s21edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "pricelist-search",
    page: "/price-list-template",
    target: '[data-tour="pricelist-search"]',
    icon: Search,
    titleKey: "guide.pricelist.s21f",
    descKey: "guide.pricelist.s21fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "pricelist-table",
    page: "/price-list-template",
    target: '[data-tour="pricelist-table"]',
    icon: List,
    titleKey: "guide.pricelist.s21g",
    descKey: "guide.pricelist.s21gdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Role Management (List) ──
  {
    id: "role-intro",
    page: "/role-management",
    icon: Shield,
    titleKey: "guide.role.s22a",
    descKey: "guide.role.s22adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "role-add",
    page: "/role-management",
    target: '[data-tour="role-add"]',
    icon: Plus,
    titleKey: "guide.role.s22b",
    descKey: "guide.role.s22bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "role-table",
    page: "/role-management",
    target: '[data-tour="role-table"]',
    icon: List,
    titleKey: "guide.role.s22c",
    descKey: "guide.role.s22cdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Member Tier ──
  {
    id: "tier-intro",
    page: "/member-tier",
    icon: Award,
    titleKey: "guide.tier.s23a",
    descKey: "guide.tier.s23adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tier-stat-active",
    page: "/member-tier",
    target: '[data-tour="tier-stat-active"]',
    icon: BarChart3,
    titleKey: "guide.tier.s23b",
    descKey: "guide.tier.s23bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tier-stat-members",
    page: "/member-tier",
    target: '[data-tour="tier-stat-members"]',
    icon: BarChart3,
    titleKey: "guide.tier.s23c",
    descKey: "guide.tier.s23cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tier-stat-growth",
    page: "/member-tier",
    target: '[data-tour="tier-stat-growth"]',
    icon: BarChart3,
    titleKey: "guide.tier.s23d",
    descKey: "guide.tier.s23ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tier-add",
    page: "/member-tier",
    target: '[data-tour="tier-add"]',
    icon: Plus,
    titleKey: "guide.tier.s23e",
    descKey: "guide.tier.s23edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tier-search",
    page: "/member-tier",
    target: '[data-tour="tier-search"]',
    icon: Search,
    titleKey: "guide.tier.s23f",
    descKey: "guide.tier.s23fdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "tier-table",
    page: "/member-tier",
    target: '[data-tour="tier-table"]',
    icon: List,
    titleKey: "guide.tier.s23g",
    descKey: "guide.tier.s23gdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Support ──
  {
    id: "support-intro",
    page: "/support",
    icon: HelpCircle,
    titleKey: "guide.support.s24a",
    descKey: "guide.support.s24adesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "support-contact-email",
    page: "/support",
    target: '[data-tour="support-contact-email"]',
    icon: Mail,
    titleKey: "guide.support.s24b",
    descKey: "guide.support.s24bdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "support-contact-phone",
    page: "/support",
    target: '[data-tour="support-contact-phone"]',
    icon: Phone,
    titleKey: "guide.support.s24c",
    descKey: "guide.support.s24cdesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "support-contact-chat",
    page: "/support",
    target: '[data-tour="support-contact-chat"]',
    icon: MessageCircle,
    titleKey: "guide.support.s24d",
    descKey: "guide.support.s24ddesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "support-faq",
    page: "/support",
    target: '[data-tour="support-faq"]',
    icon: HelpCircle,
    titleKey: "guide.support.s24e",
    descKey: "guide.support.s24edesc",
    actionKey: "guide.dashboard.next"
  },
  {
    id: "support-resources",
    page: "/support",
    target: '[data-tour="support-resources"]',
    icon: BookOpen,
    titleKey: "guide.support.s24f",
    descKey: "guide.support.s24fdesc",
    actionKey: "guide.dashboard.next"
  },

  // ── Done ──
  {
    id: "complete",
    page: null,
    icon: CheckCircle2,
    titleKey: "guide.dashboard.complete",
    descKey: "guide.dashboard.complete.desc",
    actionKey: "guide.dashboard.finish"
  }
];
