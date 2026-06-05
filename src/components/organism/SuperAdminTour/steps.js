import {
  Rocket,
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Store,
  Package,
  Award,
  Users,
  Shield,
  Settings,
  BarChart3,
  CheckCircle2
} from "lucide-react";

export const superAdminSteps = [
  {
    id: "welcome",
    page: null,
    icon: Rocket,
    title: "Selamat Datang Super Admin!",
    description:
      "Tur ini akan memandu kamu menyiapkan sistem POS dari awal hingga siap digunakan. Kamu akan diajak mengatur toko, produk, karyawan, dan pengaturan penting lainnya.",
    action: "Mulai Tur"
  },
  {
    id: "dashboard-stats",
    page: "/dashboard-super-admin",
    target: '[data-tour="dashboard-stats"]',
    icon: LayoutDashboard,
    title: "Ringkasan Bisnis",
    description:
      "Ini kartu ringkasan bisnis kamu: pendapatan, jumlah pesanan, produk aktif, member, dan stok menipis. Pantau semuanya sekilas di sini.",
    action: "Lanjut"
  },
  {
    id: "dashboard-chart",
    page: "/dashboard-super-admin",
    target: '[data-tour="dashboard-chart"]',
    icon: TrendingUp,
    title: "Grafik Penjualan",
    description:
      "Grafik penjualan mingguan. Lihat tren pendapatan kamu dari hari ke hari. Bisa di-download juga laporannya.",
    action: "Lanjut"
  },
  {
    id: "dashboard-orders",
    page: "/dashboard-super-admin",
    target: '[data-tour="dashboard-orders"]',
    icon: ShoppingCart,
    title: "Pesanan Terbaru",
    description:
      "Daftar transaksi terbaru. Lihat status, total, dan detail pesanan. Klik icon mata untuk lihat detail atau print struk.",
    action: "Lanjut ke Toko"
  },
  {
    id: "location",
    page: "/location-list",
    target: '[data-tour="page-location"]',
    icon: Store,
    title: "Kelola Toko / Outlet",
    description:
      "Buat outlet atau toko pertama kamu. Isi nama, alamat, nomor telepon, dan informasi lainnya. Kamu bisa punya banyak toko.",
    action: "Lanjut ke Produk"
  },
  {
    id: "products",
    page: "/product-list",
    target: '[data-tour="page-products"]',
    icon: Package,
    title: "Daftar Produk",
    description:
      "Tambahkan produk yang akan dijual. Sebelumnya, pastikan kamu sudah membuat Kategori dan Supplier di menu Produk.",
    action: "Lanjut ke Member"
  },
  {
    id: "member-tier",
    page: "/member-tier",
    target: '[data-tour="page-member-tier"]',
    icon: Award,
    title: "Level / Tier Member",
    description:
      "Buat tingkatan member, misalnya Bronze, Silver, Gold. Tentukan benefit dan syarat poin untuk setiap level.",
    action: "Lanjut ke Karyawan"
  },
  {
    id: "employees",
    page: "/employee-list",
    target: '[data-tour="page-employees"]',
    icon: Users,
    title: "Manajemen Karyawan",
    description:
      "Tambahkan karyawan yang akan menggunakan sistem. Jangan lupa buat Departemen dan Posisi terlebih dahulu.",
    action: "Lanjut ke Role"
  },
  {
    id: "roles",
    page: "/role-management",
    target: '[data-tour="page-roles"]',
    icon: Shield,
    title: "Role & Izin Akses",
    description:
      "Atur hak akses setiap role. Tentukan menu dan fitur apa saja yang bisa diakses oleh admin, kasir, atau karyawan.",
    action: "Lanjut ke Pengaturan"
  },
  {
    id: "settings",
    page: "/invoice-page",
    target: '[data-tour="page-settings"]',
    icon: Settings,
    title: "Pengaturan Sistem",
    description:
      "Konfigurasi invoice, pajak, template harga, dan pengaturan lainnya di menu Pengaturan.",
    action: "Lanjut ke Laporan"
  },
  {
    id: "reports",
    page: "/report/sales",
    target: '[data-tour="page-reports"]',
    icon: BarChart3,
    title: "Laporan Penjualan",
    description:
      "Pantau penjualan harian, mingguan, atau bulanan. Lihat produk terlaris dan analisis bisnis kamu.",
    action: "Selesai"
  },
  {
    id: "complete",
    page: null,
    icon: CheckCircle2,
    title: "Selesai!",
    description:
      "Kamu sudah siap menggunakan BisaNota POS! Tur ini bisa diakses kapan saja melalui tombol bantuan di pojok kanan bawah.",
    action: "Tutup"
  }
];
