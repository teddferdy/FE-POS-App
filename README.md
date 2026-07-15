# Bisa Nota - Frontend

Point of Sale (POS) web application frontend built with React, Vite, and shadcn/ui.

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18, Vite 5 |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS 3 |
| **State Management** | Zustand, React Query |
| **Forms** | React Hook Form + Zod validation |
| **Routing** | React Router v6 |
| **i18n** | i18next (EN, ID, JP) |
| **HTTP** | Axios |
| **Real-time** | Socket.IO Client |
| **Charts** | Recharts |
| **Maps** | Leaflet + React-Leaflet |
| **Monitoring** | Sentry |
| **Export/Import** | SheetJS (xlsx) |
| **PWA** | Service Worker + Manifest |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd FE-POS-App
npm install
```

### Environment Variables

Create `.env` file:

```env
VITE_BASE_URL=https://api-bisa-nota.vercel.app
```

### Development

```bash
npm run dev        # Start dev server on http://localhost:3000
```

### Build & Deploy

```bash
npm run build      # Production build
npm run preview    # Preview production build
```

### Other Commands

```bash
npm run lint       # Run ESLint
npm run test       # Run Jest tests
```

---

## Project Structure

```
src/
├── assets/               # Static images (flags, icons)
├── components/
│   ├── layout/           # DashboardLayout, Sidebar, Header, CommandPalette
│   ├── organism/         # Complex feature components (modals, tour, FAQ chat)
│   └── ui/               # shadcn/ui base components (Button, Input, Table, etc.)
├── hooks/                # Custom hooks (useDebounce, useKeyboardShortcuts, etc.)
├── i18n/                 # Translations (en.json, id.json, jpn.json)
├── lib/                  # Utility libraries, constants
├── page/                 # Page components (45+ modules, lazy-loaded)
├── services/             # API service layer (50+ files, Axios-based)
├── state/                # Zustand stores (theme, checkout, order, tour, etc.)
├── utils/                # Utilities (permissions, sidebar menu, formatters)
├── App.jsx               # Root router config
└── index.jsx             # Entry point
```

---

## Features

### Core POS
- **Cashier Terminal** - Product grid, cart, order queue, checkout
- **Kitchen Display System (KDS)** - Real-time order notifications via Socket.IO
- **Customer Self-Order** - QR code menu, cart, and order tracking
- **Customer Display** - Customer-facing order display screen
- **Split Bill** - Divide orders among multiple customers
- **Thermal Printing** - ESC/POS receipt printing via Bluetooth

### Inventory & Procurement
- **Product Management** - CRUD, categories, sub-categories, images, per-store pricing
- **Stock Management** - History, opname, adjustment, low stock alerts
- **Stock Transfer** - Inter-store transfers with receive/cancel workflow
- **Purchase Orders** - Create, approve, partial payments, goods receipt
- **Production Orders** - BOM/recipes, ingredient deduction, production lifecycle
- **Goods Receipt** - Receive goods from suppliers with quality checking
- **Sales & Purchase Returns** - Customer/supplier return workflows

### People & Access
- **Employee Management** - CRUD with avatar, salary, contract info
- **Role-Based Access Control (RBAC)** - 5 role types, granular per-menu permissions
- **Departments & Positions** - Hierarchical organization management
- **Members & Loyalty** - Points accumulation, redemption, tier system

### Finance & Reporting
- **Cash Register** - Open/close sessions, history
- **Expense Management** - Categories, approval workflow
- **Accounts Receivable** - AR tracking, aging reports, payments
- **Purchase Payments** - AP tracking, installments
- **Tax Configuration** - PPN, service charges per store
- **Reports** - Sales, daily summary, profit/loss, cash flow, best selling

### Settings & Config
- **Store/Location Management** - Multi-branch with geospatial map view
- **Payment Types** - Cash, e-wallet, QRIS, custom types
- **Discount Management** - Percentage/fixed, date range, store scope
- **Shift Management** - Work shifts per store
- **Invoice/Receipt Settings** - Logo, footer, social media, preview
- **Reservation System** - Table reservations with date/time/guest management
- **Notifications** - In-app notification system

### Platform Features
- **Internationalization (i18n)** - English, Indonesian, Japanese
- **Dark Mode** - Full dark theme support
- **PWA** - Offline indicator, auto-sync on reconnect
- **Keyboard Shortcuts** - Ctrl+S (submit), Ctrl+N (add new)
- **Guided Tours** - Super admin onboarding tour
- **Excel Import/Export** - Products, suppliers, categories, departments, positions
- **Error Monitoring** - Sentry integration with session replay
- **Command Palette** - Quick navigation (Cmd+K)

---

## Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Login |
| `/register` | Registration |
| `/reset-password` | Password Reset |
| `/home` | Cashier Terminal |
| `/customer-order` | Customer QR Self-Order Menu |
| `/customer-display` | Customer Display Screen |

### Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard-super-admin` | Super Admin Dashboard (all stores) |
| `/dashboard-admin` | Admin Dashboard (single store) |

### POS & Operations
| Route | Description |
|-------|-------------|
| `/kitchen-display` | Kitchen Display System |
| `/qr-order-management` | QR Order Management |
| `/cash-register/*` | Cash Register (open/close, current, history) |
| `/table-list` | Table Management |

### Products & Inventory
| Route | Description |
|-------|-------------|
| `/product-list` | Product List |
| `/category-list` | Category List |
| `/ingredient` | Ingredient List |
| `/ingredient-category` | Ingredient Category List |
| `/stock-history` | Stock History |
| `/stock-opname` | Stock Opname |
| `/stock-transfer` | Stock Transfer |
| `/low-stock` | Low Stock Alerts |
| `/stock-adjustment` | Stock Adjustment |

### Procurement & Production
| Route | Description |
|-------|-------------|
| `/supplier` | Supplier List |
| `/purchase-order` | Purchase Order List |
| `/purchase-payment` | Purchase Payment List |
| `/goods-receipt` | Goods Receipt List |
| `/bom` | Bill of Materials |
| `/production-order` | Production Order List |
| `/sales-return` | Sales Return List |
| `/purchase-return` | Purchase Return List |

### People
| Route | Description |
|-------|-------------|
| `/employee-list` | Employee List |
| `/user-list` | User List |
| `/role-management` | Role Management |
| `/department-list` | Department List |
| `/position-list` | Position List |

### Members & Loyalty
| Route | Description |
|-------|-------------|
| `/member-list` | Member List |
| `/member-tier` | Member Tier List |
| `/member-point-history` | Point History |

### Finance & Reports
| Route | Description |
|-------|-------------|
| `/accounts-receivable` | Accounts Receivable |
| `/ar-payment` | AR Payments |
| `/expense` | Expense List |
| `/expense-category` | Expense Category List |
| `/report/sales` | Sales Report |
| `/report/daily` | Daily Report |
| `/report/profit-loss` | Profit & Loss Report |
| `/report/cash-flow` | Cash Flow Report |
| `/best-selling` | Best Selling Report |

### Settings
| Route | Description |
|-------|-------------|
| `/location-list` | Store/Location List |
| `/store-geospatial` | Store Geospatial Map |
| `/type-payment-list` | Payment Type List |
| `/discount-list` | Discount List |
| `/shift-list` | Shift List |
| `/tax-list` | Tax Config List |
| `/invoice-page` | Invoice/Receipt Settings |
| `/reservation` | Reservation List |
| `/notification` | Notifications |
| `/profile` | User Profile |
| `/backup` | Backup & Restore |

---

## Role-Based Access

| Role | Description | Access |
|------|-------------|--------|
| **super_admin** | Owner | All stores, all features |
| **admin** | Store Manager | Store-level access |
| **cashier** | POS Staff | POS + Membership |
| **user** | General Staff | Dashboard + basic reports |
| **kitchen** | Kitchen Staff | KDS only |

Sidebar menus, page access, and button permissions are all controlled by RBAC. See `src/utils/sidebar-menu.js` and `src/utils/permission.js`.

---

## Environment

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BASE_URL` | Backend API URL | `https://api-bisa-nota.vercel.app` |

---

## Deployment

Deployed on **Vercel** with SPA rewrites configured in `vercel.json`.

- **Demo**: https://bisa-nota-demo.vercel.app
- **API**: https://api-bisa-nota.vercel.app

---

## Related

- [Backend API](../BE-POS-APP/README.md)
- [Super Admin Guide](./PANDUAN-SUPER-ADMIN.md)
