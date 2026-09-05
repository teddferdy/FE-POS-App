export const getPayablePurchaseOrders = (purchaseOrders = []) =>
  (Array.isArray(purchaseOrders) ? purchaseOrders : [])
    .map((po) => {
      const finalAmount = Number(po?.finalAmount || 0);
      const amountPaid = (po?.payments || []).reduce((sum, p) => sum + Number(p?.amount || 0), 0);
      return {
        id: po?.id,
        orderNumber: po?.orderNumber,
        finalAmount,
        amountPaid,
        outstanding: finalAmount - amountPaid
      };
    })
    .filter((po) => po.outstanding > 0);
