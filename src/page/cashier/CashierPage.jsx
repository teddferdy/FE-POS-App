/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { ShoppingCart, X, Package } from "lucide-react";
import { getProductByOutlet } from "@/services/product";
import { orderList } from "@/state/order-list";
import { Button } from "@/components/ui/button";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import CheckoutModal from "./components/CheckoutModal";
import ReceiptModal from "./components/ReceiptModal";

const CashierPage = () => {
  const [cookie] = useCookies();
  const store = cookie?.store;
  const cashierName = cookie?.name || "Kasir";
  const storeName = cookie?.store_name || "Toko";

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const cart = orderList();

  const { data: productsData, isLoading } = useQuery(
    ["products-outlet", store],
    () => getProductByOutlet({ location: store }),
    { enabled: !!store }
  );

  const products = productsData?.data || productsData || [];

  const filteredProducts = products.filter((p) => {
    const name = (p.nameProduct || p.name || "").toLowerCase();
    const sku = (p.sku || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !search || name.includes(q) || sku.includes(q);
    const cat = p.category?.id || p.category?._id || p.categoryId?.id || p.categoryId?._id || "";
    const matchesCategory = !categoryId || cat === categoryId;
    return matchesSearch && matchesCategory;
  });

  const totalItems = cart.order.reduce((sum, item) => sum + (item.count || 0), 0);
  const subtotal = cart.order.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

  const handleCheckoutComplete = (result) => {
    setReceiptData(result);
    setCheckoutOpen(false);
  };

  const handleNewTransaction = () => {
    cart.resetOrder();
    setReceiptData(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Package className="text-primary" size={24} />
          <div>
            <h1 className="text-lg font-bold leading-tight">{storeName}</h1>
            <p className="text-xs text-muted-foreground">{cashierName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
            <span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
            <ClockIcon className="ml-1" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden relative"
            onClick={() => setShowCartMobile(!showCartMobile)}>
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            search={search}
            onSearchChange={setSearch}
            barcode={barcode}
            onBarcodeChange={setBarcode}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            store={store}
          />
        </div>

        <div
          className={`${
            showCartMobile ? "fixed inset-0 z-40 flex" : "hidden"
          } lg:relative lg:flex lg:w-[380px] xl:w-[420px] border-l border-border bg-card`}>
          {showCartMobile && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden"
              onClick={() => setShowCartMobile(false)}
            />
          )}
          <div
            className={`${
              showCartMobile ? "relative ml-auto" : ""
            } w-full max-w-md lg:max-w-none bg-card flex flex-col h-full`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:hidden">
              <h2 className="font-semibold">Pesanan ({totalItems})</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCartMobile(false)}>
                <X size={18} />
              </Button>
            </div>
            <CartPanel
              items={cart.order}
              subtotal={subtotal}
              onIncrement={cart.incrementOrder}
              onDecrement={cart.decrementOrder}
              onDelete={cart.handleDeleteOrder}
              onCheckout={() => setCheckoutOpen(true)}
              totalItems={totalItems}
              onUpdatePrice={(item, newPrice) => cart.updateItemPrice(item, newPrice)}
            />
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          items={cart.order}
          subtotal={subtotal}
          store={store}
          cashierName={cashierName}
          onComplete={handleCheckoutComplete}
        />
      )}

      {receiptData && (
        <ReceiptModal
          data={receiptData}
          onClose={() => setReceiptData(null)}
          onNewTransaction={handleNewTransaction}
        />
      )}
    </div>
  );
};

function ClockIcon({ className }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={className}>
      {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

export default CashierPage;
