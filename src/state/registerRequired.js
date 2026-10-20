import { create } from "zustand";

// Any sale, settlement or split payment the backend refuses with
// 422 REGISTER_REQUIRED (no open cash register for the store) opens one
// app-wide dialog that sends the cashier to /cash-register/open-close.
// Raised from the axios response interceptor, so every screen gets it.

export const REGISTER_REQUIRED = "REGISTER_REQUIRED";

export const isRegisterRequiredError = (err) =>
  err?.response?.status === 422 && err?.response?.data?.code === REGISTER_REQUIRED;

export const useRegisterRequiredStore = create((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false })
}));
