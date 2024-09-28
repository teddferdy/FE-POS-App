export const sidebarMenuAdmin = [
  {
    title: "Admin Menu",
    href: "/admin-page"
    // icon: LayoutDashboard
  },
  {
    title: "Cashier",
    href: "/home"
    // icon: Calendar
  },
  {
    title: "Product Menu",
    href: "/product-page",
    // icon: Building,
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
    // icon: Building,
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
    href: "/location-list"
    // icon: Briefcase
  },
  {
    title: "Discount",
    href: "/discount-list"
    // icon: Backpack
  },
  {
    title: "My Teams",
    href: "/product-page",
    // icon: Building,
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
    href: "/member-list"
    // icon: GraduationCap
  },
  {
    title: "Type Payment",
    href: "/type-payment-list"
    // icon: Settings
  },
  {
    title: "Social Media",
    href: "/social-media-list"
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
  }
];
