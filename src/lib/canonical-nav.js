import { Building2, SlidersHorizontal, Store } from "lucide-react";

const LOCATION_CATEGORY_ID = "location";
const STORE_SECTION_KEY = "sidebar.section.kelolaToko";

// Tenant administration (tenant.manage, platform only) and Store
// Configuration (store.manage) are decided by the canonical authorization
// context, not by roleType/accessMenu. They live in the Location ("Lokasi")
// category's "Kelola Toko" section next to the store list. A role whose
// categories have no Location category (e.g. a tenant admin on the admin
// menu) gets one holding just these items.
// Display order inside the "Kelola Toko" section: Tenant first, then the
// store list ("Kelola Toko"), then Store Configuration last.
const splitCanonicalItems = (permissions) => {
  const tenantItems = [];
  const storeItems = [];
  if (permissions.canManageTenants) {
    tenantItems.push({
      title: "Tenant",
      i18nKey: "page.tenant.title",
      href: "/tenant",
      icon: Building2
    });
  }
  if (permissions.canManageStores) {
    storeItems.push({
      title: "Konfigurasi Toko",
      i18nKey: "page.storeConfiguration.title",
      href: "/store-configuration",
      icon: SlidersHorizontal
    });
  }
  return { tenantItems, storeItems };
};

export const canonicalLocationNavItems = (permissions) => {
  const { tenantItems, storeItems } = splitCanonicalItems(permissions);
  return [...tenantItems, ...storeItems];
};

export const withCanonicalLocationItems = (categories, permissions) => {
  const { tenantItems, storeItems } = splitCanonicalItems(permissions);
  const items = [...tenantItems, ...storeItems];
  if (items.length === 0) return categories;

  const index = categories.findIndex((cat) => cat.id === LOCATION_CATEGORY_ID);
  if (index === -1) {
    return [
      ...categories,
      {
        id: LOCATION_CATEGORY_ID,
        icon: Store,
        title: "Location",
        i18nKey: "sidebar.section.location",
        sections: [{ title: "Kelola Toko", i18nKey: STORE_SECTION_KEY, items }]
      }
    ];
  }

  return categories.map((cat, i) => {
    if (i !== index) return cat;
    const sections = cat.sections || [];
    const storeSection = sections.findIndex((s) => s.i18nKey === STORE_SECTION_KEY);
    if (storeSection === -1) {
      return {
        ...cat,
        sections: [{ title: "Kelola Toko", i18nKey: STORE_SECTION_KEY, items }, ...sections]
      };
    }
    return {
      ...cat,
      sections: sections.map((s, j) =>
        j === storeSection
          ? { ...s, items: [...tenantItems, ...(s.items || []), ...storeItems] }
          : s
      )
    };
  });
};
