export const invalidatePurchasePaymentCaches = (queryClient) => {
  queryClient?.invalidateQueries(["purchase-payments"]);
  queryClient?.invalidateQueries(["purchase-orders"]);
};
