// ponytail: builder murni untuk CommandPalette agar mudah di-unit-test
// dan selalu sinkron dengan struktur menu sidebar

export const extraPages = [
  { path: "/add-product", label: "Tambah Produk", keywords: "tambah produk add product" },
  { path: "/edit-product", label: "Edit Produk", keywords: "edit produk product" },
  { path: "/add-category", label: "Tambah Kategori", keywords: "tambah kategori add category" },
  { path: "/add-supplier", label: "Tambah Supplier", keywords: "tambah supplier add" },
  {
    path: "/supplier-comparison",
    label: "Bandingkan Supplier",
    keywords: "bandingkan supplier compare"
  },
  { path: "/add-member", label: "Tambah Member", keywords: "tambah member add" },
  { path: "/add-discount", label: "Tambah Diskon", keywords: "tambah diskon add discount" },
  { path: "/add-stock-opname", label: "Tambah Stock Opname", keywords: "tambah stock opname add" },
  { path: "/add-purchase-order", label: "Tambah PO", keywords: "tambah purchase order po" },
  { path: "/add-employee", label: "Tambah Karyawan", keywords: "tambah karyawan add employee" },
  { path: "/add-location", label: "Tambah Toko", keywords: "tambah toko add location store" },
  { path: "/store-geospatial", label: "Peta Toko", keywords: "peta toko geospatial map" },
  { path: "/add-user", label: "Tambah Admin", keywords: "tambah admin add user" },
  { path: "/support", label: "Support", keywords: "support bantuan help faq kontak cs" },
  { path: "/add-role", label: "Tambah Role", keywords: "tambah role add" },
  { path: "/add-tax", label: "Tambah Pajak", keywords: "tambah pajak add tax" },
  { path: "/notification", label: "Notifikasi", keywords: "notifikasi notification" }
];

// ponytail: halaman turunan mewarisi izin dari halaman induknya di sidebar;
// array kosong = selalu tampil. /add-* & /edit-* juga menuntut action add/edit.
export const extraParents = {
  "/add-product": ["/product-list"],
  "/edit-product": ["/product-list"],
  "/add-category": ["/category-list"],
  "/add-supplier": ["/supplier"],
  "/supplier-comparison": ["/supplier"],
  "/add-member": ["/member-list"],
  "/add-discount": ["/discount-list"],
  "/add-stock-opname": ["/stock-opname"],
  "/add-purchase-order": ["/purchase-order"],
  "/add-employee": ["/employee-list", "/user-list"],
  "/add-location": ["/location-list"],
  "/store-geospatial": ["/location-list"],
  "/add-user": ["/employee-list", "/user-list"],
  "/support": [],
  "/notification": [],
  "/add-role": ["/role-management"],
  "/add-tax": ["/tax-list"]
};

const normalizeItem = (raw, t) => ({
  path: raw.href || raw.path,
  label: raw.i18nKey
    ? t(raw.i18nKey, { defaultValue: raw.title })
    : t(raw.path || raw.href, { defaultValue: raw.label || raw.title }),
  keywords: `${raw.keywords || ""} ${raw.title || ""}`,
  icon: raw.icon
});

const getRequiredAction = (path) =>
  path.startsWith("/add-") ? "add" : path.startsWith("/edit-") ? "edit" : null;

const isExtraVisible = (extra, permittedActions) => {
  const parents = extraParents[extra.path] || [];
  if (parents.length === 0) return true;
  const requiredAction = getRequiredAction(extra.path);
  return parents.some((p) => {
    const actions = permittedActions.get(p);
    if (!actions) return false;
    return !requiredAction || actions.includes(requiredAction);
  });
};

/**
 * Bangun grup palette dari menu sidebar yang sudah difilter izin.
 * @param {Array} menuItems hasil filterMenuByPermission(baseMenu, user)
 * @param {Function} t fungsi terjemahan i18n
 */
export const buildPaletteGroups = (menuItems, t) => {
  const knownPaths = new Map();
  const sectionGroups = [];
  const directItems = [];

  menuItems.forEach((item) => {
    const children = (item.children || []).filter((c) => c.href);
    if (children.length > 0) {
      children.forEach((c) => knownPaths.set(c.href, c.actions || []));
      sectionGroups.push({
        id: item.i18nKey || item.title,
        title: t(item.i18nKey, { defaultValue: item.title }),
        items: children.map((c) => normalizeItem(c, t))
      });
    } else if (item.href) {
      directItems.push(item);
      knownPaths.set(item.href, item.actions || []);
    }
  });

  const result = [];
  if (directItems.length > 0) {
    result.push({
      id: "main",
      title: t("commandPalette.groupMain"),
      items: directItems.map((i) => normalizeItem(i, t))
    });
  }
  result.push(...sectionGroups);

  const extras = extraPages.filter((p) => !knownPaths.has(p.path) && isExtraVisible(p, knownPaths));
  if (extras.length > 0) {
    result.push({
      id: "more",
      title: t("commandPalette.groupMore"),
      items: extras.map((e) => normalizeItem(e, t))
    });
  }
  return result;
};

export const filterPaletteGroups = (groups, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        `${item.label} ${item.keywords} ${item.path}`.toLowerCase().includes(q)
      )
    }))
    .filter((g) => g.items.length > 0);
};
