import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const INITIAL_STATE = {
  id: 0,
  open: false,
  invoice: "",
  totalPrice: "",
  cashierName: "",
  totalItems: ""
};

export const invoice = create(
  persist(
    (set) => ({
      data: INITIAL_STATE,
      updateInvoice: (invoiceData) => {
        console.log("INVOICE DATA =>", invoiceData);
        return set({
          data: {
            id: invoiceData.id,
            dateOrder: invoiceData.dateOrder,
            open: true,
            invoice: invoiceData.invoice,
            totalPrice: invoiceData.totalPrice,
            cashierName: invoiceData.cashierName,
            totalItems: invoiceData.totalQuantity
          }
        });
      },
      cancelInvoice: () => {
        return set({
          data: INITIAL_STATE
        });
      }
    }),
    {
      name: "invoice",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
