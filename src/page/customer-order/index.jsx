import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Send, QrCode, ChevronLeft, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Modal from "@/components/organism/modal";
import { axiosInstance } from "@/services";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CustomerOrder = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get("table");
  const storeId = searchParams.get("store");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    axiosInstance
      .get(`/order/customer-menu?store=${storeId}`)
      .then((res) => {
        if (res.data?.data) {
          setProducts(res.data.data.products || []);
          setCategories(res.data.data.categories || []);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error(t("page.customerOrder.loadMenuFail"), {
          description: e?.response?.data?.message || e.message
        });
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => String(p.category || p.categoryId) === String(activeCategory));

  const prodName = (p) => p.name || p.nameProduct || "-";
  const prodPrice = (p) => Number(p.sellingPrice || p.price || 0);
  const prodId = (p) => p.id || p.productId;

  const addToCart = (product) => {
    const pid = prodId(product);
    setCart(prev => {
      const existing = prev.find(item => item.productId === pid);
      if (existing) {
        return prev.map(item =>
          item.productId === pid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: pid,
        productName: prodName(product),
        price: prodPrice(product),
        quantity: 1,
        notes: ""
      }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!storeId || cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/order/customer-create", {
        store: Number(storeId),
        tableId: tableId ? Number(tableId) : null,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || null
        })),
        customerName: customerName || null,
      });
      if (res.data?.data?.orderNumber) {
        setOrderNumber(res.data.data.orderNumber);
      } else if (res.data?.orderNumber) {
        setOrderNumber(res.data.orderNumber);
      }
      setSuccessModal(true);
      setCart([]);
      setCustomerName("");
    } catch (e) {
      toast.error(t("page.customerOrder.fail"), {
        description: e?.response?.data?.message || e.message || t("page.customerOrder.failDesc")
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <QrCode size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">{t("page.customerOrder.invalidQr")}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {t("page.customerOrder.scanQrToOrder")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Store size={20} className="text-orange-600" />
          <div className="flex-1">
            <h1 className="font-bold text-lg">{t("page.customerOrder.title")}</h1>
            {tableId && <p className="text-xs text-muted-foreground">{t("page.customerOrder.tableNumber", { number: tableId })}</p>}
          </div>
          <div className="relative">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Category tabs */}
      <div className="max-w-lg mx-auto px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-orange-600 text-white"
                : "bg-white text-foreground border hover:bg-orange-50"
            }`}
          >
            {t("page.customerOrder.allCategory")}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-orange-600 text-white"
                  : "bg-white text-foreground border hover:bg-orange-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <main className="max-w-lg mx-auto px-4 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">{t("page.customerOrder.loading")}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t("page.customerOrder.noProducts")}</p>
        ) : (
          filteredProducts.map(product => (
            <Card key={prodId(product)} className="p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl flex-shrink-0">
                {prodName(product).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{prodName(product)}</h3>
                <p className="text-orange-600 font-bold text-sm mt-0.5">
                  Rp{prodPrice(product).toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0"
                onClick={() => addToCart(product)}
              >
                <Plus size={16} />
              </Button>
            </Card>
          ))
        )}
      </main>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="max-w-lg mx-auto p-4 space-y-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1">{item.productName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.productId, -1)}
                    >
                      <Minus size={12} />
                    </Button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.productId, 1)}
                    >
                      <Plus size={12} />
                    </Button>
                    <span className="w-16 text-right font-medium">
                      Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Input
                placeholder={t("page.customerOrder.namePlaceholder")}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-sm h-9"
              />
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{t("page.customerOrder.total")}</p>
                <p className="font-bold text-orange-600">
                  Rp{totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                onClick={placeOrder}
                disabled={submitting}
                className="gap-1 shrink-0"
              >
                <Send size={16} />
                {submitting ? t("page.customerOrder.submitting") : t("page.customerOrder.order")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.customerOrder.successModalTitle")}
        description={t("page.customerOrder.successModalDesc", { orderNumber })}
        confirmText={t("page.customerOrder.successModalConfirm")}
        onConfirm={() => setSuccessModal(false)}
      />
    </div>
    </motion.div>
  );
};

export default CustomerOrder;
