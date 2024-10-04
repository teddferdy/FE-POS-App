import {
  Crown,
  Calculator,
  UtensilsCrossed,
  Clipboard,
  Map,
  TicketPercent,
  Users,
  BookUser,
  WalletCards,
  Globe
} from "lucide-react";

export const sidebarMenuAdmin = [
  {
    title: "Admin Menu",
    href: "/admin-page",
    icon: Crown
  },
  {
    title: "Cashier",
    href: "/home",
    icon: Calculator
  },
  {
    title: "Product Menu",
    href: "/product-page",
    icon: UtensilsCrossed,
    children: [
      {
        title: "Category",
        href: "/category-list"
      },
      {
        title: "Sub Category",
        href: "/sub-category-list"
      },
      {
        title: "Product",
        href: "/product-list"
      }
    ]
  },
  {
    title: "Invoice",
    href: "/invoice-page",
    icon: Clipboard,
    children: [
      {
        title: "Logo Invoice",
        href: "/logo-invoice-list"
      },
      {
        title: "Footer Invoice",
        href: "/footer-invoice-list"
      },
      {
        title: "Social Media Invoice",
        href: "/social-media-invoice-list"
      }
    ]
  },

  {
    title: "Location",
    href: "/location-list",
    icon: Map
  },
  {
    title: "Discount",
    href: "/discount-list",
    icon: TicketPercent
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
        title: "Edit Employee (Coming Soon)",
        href: "/#"
      }
      //   {
      //     title: "Product",
      //     href: "/product-list"
      //   }
    ]
  },
  {
    title: "Member List",
    href: "/member-list",
    icon: BookUser
  },
  {
    title: "Type Payment",
    href: "/type-payment-list",
    icon: WalletCards
  },
  {
    title: "Social Media",
    href: "/social-media-list",
    icon: Globe
  }
];

export const sidebarMenuUser = [
  {
    title: "Cashier",
    href: "/home"
    // icon: Calendar
  },
  {
    title: "Member List",
    href: "/member-list"
    // icon: GraduationCap
  }
];

// ARROW BACK
export const urlWithArrowBack = [
  {
    url: -1,
    title: "Admin Menu",
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
