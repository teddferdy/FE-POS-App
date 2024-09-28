import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const INITIAL_STATE = {
  open: false,
  typeOrder: "",
  noInvoice: "",
  isMember: false,
  typePayment: "",
  memberName: "",
  memberPhoneNumber: "",
  cashierName: ""
};

export const invoice = create(
  persist(
    (set) => ({
      data: INITIAL_STATE,
      updateInvoice: (invoiceData) => {
        return set((items) => {
          return {
            data: {
              ...items.data,
              open: true,
              typeOrder: invoiceData.typeOrder,
              isMember: invoiceData.isMember,
              typePayment: invoiceData.typePayment,
              memberName: invoiceData.memberName,
              memberPhoneNumber: invoiceData.memberPhoneNumber
            }
          };
        });
      },
      updateInvoiceNumber: (invoiceData) => {
        console.log("INVOICE DATA =>", invoiceData);

        return set((items) => {
          return {
            data: {
              ...items.data,
              noInvoice: invoiceData.noInvoice,
              cashierName: invoiceData.cashierName
            }
          };
        });
      },
      resetInvoice: () => {
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
