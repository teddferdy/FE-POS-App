import {
  Crown,
  Calculator,
  UtensilsCrossed,
  Clipboard,
  // Map,
  // TicketPercent,
  Users,
  BookUser,
  WalletCards,
  Globe,
  CalendarDays,
  Store
} from "lucide-react";

export const sidebarMenuSuperAdmin = [
  // Overview Page
  {
    title: "Dashboard",
    href: "/admin-page",
    icon: Crown
  },
  // Product List
  {
    title: "Master Data",
    href: "",
    icon: Crown,
    children: [
      {
        title: "Products By Outlet",
        href: "/location-available",
        icon: UtensilsCrossed
      },
      {
        title: "Social Media",
        href: "/social-media-list",
        icon: Globe
      }
    ]
  },
  {
    title: "My Teams",
    href: "",
    icon: Users,
    children: [
      {
        title: "User",
        href: "/my-teams-location-available"
      },
      {
        title: "Position",
        href: "/position-list"
      },
      {
        title: "Role",
        href: "/role-list"
      }
    ]
  },
  {
    title: "Transaction",
    href: "",
    icon: WalletCards,
    children: [
      {
        title: "Invoice By Outlet",
        href: "/location-available",
        icon: Clipboard
      }
    ]
  },
  {
    title: "Outlet",
    href: "",
    icon: Store,
    children: [
      {
        title: "Location",
        href: "/location-list"
      }
    ]
  }

  // Location
  // {
  //   title: "Member List",
  //   href: "/member-list",
  //   icon: BookUser
  // }
];

export const sidebarMenuAdmin = [
  {
    title: "Dashboard",
    href: "/admin-page",
    icon: Crown
  },
  {
    title: "Master Data",
    href: "",
    icon: UtensilsCrossed,
    children: [
      {
        title: "Product",
        href: "/product-page"
      },
      {
        title: "Type Payment",
        href: "/type-payment-list"
      },
      {
        title: "Discount",
        href: "/discount-list"
      }
    ]
  },
  {
    title: "My Teams",
    href: "",
    icon: Users,
    children: [
      {
        title: "Shift List",
        href: "/shift-list"
      },
      {
        title: "User (Coming Soon)",
        href: "#"
      }
    ]
  },
  {
    title: "Outlet",
    href: "",
    icon: Store,
    children: [
      {
        title: "Member List",
        href: "/member-list"
      }
    ]
  },
  {
    title: "Transaction",
    href: "",
    icon: Store,
    children: [
      {
        title: "Invoice",
        href: "/invoice-page"
      }
    ]
  }

  // {
  //   title: "Social Media",
  //   href: "/social-media-list",
  //   icon: Globe
  // }
];

export const sidebarMenuUser = [
  {
    title: "Cashier",
    href: "/home",
    icon: Calculator
  },
  {
    title: "Member List",
    href: "/member-list",
    icon: BookUser
  },
  {
    title: "My Shift (Coming Soon)",
    href: "#",
    icon: CalendarDays
  }
];

// ARROW BACK
export const urlWithArrowBack = [
  {
    url: 0,
    title: "Dashboard",
    pathName: "/admin-page"
  },

  // List Page
  {
    url: -1,
    title: "Member List",
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

  // Form Page Category
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

  // Form Page Sub Category
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
  // Form Page Product
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
  // Form Invoice Logo
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
  // Form Invoice Footer
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
  // Form Invoice Social Media
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
  // Form Add Location
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
  // Form Discount
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
  // Form Shift
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
  // Form Type Payment
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
  // Form Social Media
  {
    url: "/social-media-list",
    title: "Add Social Media",
    pathName: "/add-social-media"
  },
  {
    url: "/social-media-list",
    title: "Edit Social Media",
    pathName: "/edit-social-media"
  }
];
