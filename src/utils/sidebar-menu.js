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
        title: "Shift",
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
