/* global __PUBLIC_REGISTRATION__ */
// DR-24 D-08: staff accounts are created by the owner (Karyawan → Tambah),
// so public sign-up is closed. A build can reopen it for a demo with
// VITE_PUBLIC_REGISTRATION_ENABLED=true (vite.config.js `define`); the BE
// enforces the same rule with PUBLIC_REGISTRATION_ENABLED.
export const isPublicRegistrationEnabled = () =>
  typeof __PUBLIC_REGISTRATION__ !== "undefined" && __PUBLIC_REGISTRATION__ === true;
