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

export const checkout = create(
  persist(
    (set) => ({
      data: INITIAL_STATE,
      updateCheckout: (checkoutData) => {
        console.log("INVOICE DATA =>", checkoutData);
        return set({
          data: {
            id: checkoutData.id,
            dateOrder: checkoutData.dateOrder,
            open: true,
            invoice: checkoutData.invoice,
            totalPrice: checkoutData.totalPrice,
            cashierName: checkoutData.cashierName,
            totalItems: checkoutData.totalQuantity
          }
        });
      },
      cancelCheckout: () => {
        return set({
          data: INITIAL_STATE
        });
      }
    }),
    {
      name: "checkout",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
