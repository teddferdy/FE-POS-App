import React from "react";
import { Route } from "react-router-dom";

// Ingredient
const IngredientList = React.lazy(() => import("@/page/ingredient/IngredientList"));
const AddIngredient = React.lazy(() => import("@/page/ingredient/AddIngredient"));
const EditIngredient = React.lazy(() => import("@/page/ingredient/EditIngredient"));
const DetailIngredient = React.lazy(() => import("@/page/ingredient/DetailIngredient"));

// Ingredient Category
const IngredientCategoryList = React.lazy(() => import("@/page/ingredient-category/CategoryList"));
const AddIngredientCategory = React.lazy(() => import("@/page/ingredient-category/AddCategory"));
const EditIngredientCategory = React.lazy(() => import("@/page/ingredient-category/EditCategory"));
const DetailIngredientCategory = React.lazy(
  () => import("@/page/ingredient-category/DetailCategory")
);

// BOM (Bill of Materials)
const BomList = React.lazy(() => import("@/page/bom/BomList"));
const AddBom = React.lazy(() => import("@/page/bom/AddBom"));
const DetailBom = React.lazy(() => import("@/page/bom/DetailBom"));

// Stock Opname
const StockOpnameList = React.lazy(() => import("@/page/stock-opname/StockOpnameList"));
const AddStockOpname = React.lazy(() => import("@/page/stock-opname/AddStockOpname"));
const DetailStockOpname = React.lazy(() => import("@/page/stock-opname/DetailStockOpname"));
const StockHistory = React.lazy(() => import("@/page/stock-opname/StockHistory"));
const LowStock = React.lazy(() => import("@/page/stock-opname/LowStock"));
const LowStockAll = React.lazy(() => import("@/page/stock-opname/LowStockAll"));

// Stock Adjustment & Transfer
const StockAdjustment = React.lazy(() => import("@/page/stock-adjustment/StockAdjustment"));
const StockTransferList = React.lazy(() => import("@/page/stock-transfer/StockTransferList"));
const AddStockTransfer = React.lazy(() => import("@/page/stock-transfer/AddStockTransfer"));
const DetailStockTransfer = React.lazy(() => import("@/page/stock-transfer/DetailStockTransfer"));

// Production Order
const ProductionOrderList = React.lazy(() => import("@/page/production-order/ProductionOrderList"));
const AddProductionOrder = React.lazy(() => import("@/page/production-order/AddProductionOrder"));
const DetailProductionOrder = React.lazy(
  () => import("@/page/production-order/DetailProductionOrder")
);

// Goods Receipt
const GoodsReceiptList = React.lazy(() => import("@/page/goods-receipt/GoodsReceiptList"));
const AddGoodsReceipt = React.lazy(() => import("@/page/goods-receipt/AddGoodsReceipt"));
const DetailGoodsReceipt = React.lazy(() => import("@/page/goods-receipt/DetailGoodsReceipt"));
const EditGoodsReceipt = React.lazy(() => import("@/page/goods-receipt/EditGoodsReceipt"));

export const inventoryRoutes = (
  <>
    <Route path="/ingredient" element={<IngredientList />} />
    <Route path="/add-ingredient" element={<AddIngredient />} />
    <Route path="/edit-ingredient" element={<EditIngredient />} />
    <Route path="/detail-ingredient" element={<DetailIngredient />} />

    <Route path="/ingredient-category" element={<IngredientCategoryList />} />
    <Route path="/add-ingredient-category" element={<AddIngredientCategory />} />
    <Route path="/edit-ingredient-category" element={<EditIngredientCategory />} />
    <Route path="/detail-ingredient-category" element={<DetailIngredientCategory />} />

    <Route path="/bom" element={<BomList />} />
    <Route path="/bom/add" element={<AddBom />} />
    <Route path="/bom/detail" element={<DetailBom />} />

    <Route path="/stock-opname" element={<StockOpnameList />} />
    <Route path="/stock-opname/detail" element={<DetailStockOpname />} />
    <Route path="/add-stock-opname" element={<AddStockOpname />} />
    <Route path="/stock-history" element={<StockHistory />} />
    <Route path="/low-stock" element={<LowStock />} />
    <Route path="/low-stock-all" element={<LowStockAll />} />
    <Route path="/stock-adjustment" element={<StockAdjustment />} />

    <Route path="/stock-transfer" element={<StockTransferList />} />
    <Route path="/add-stock-transfer" element={<AddStockTransfer />} />
    <Route path="/stock-transfer/detail" element={<DetailStockTransfer />} />

    <Route path="/production-order" element={<ProductionOrderList />} />
    <Route path="/add-production-order" element={<AddProductionOrder />} />
    <Route path="/production-order/detail" element={<DetailProductionOrder />} />

    <Route path="/goods-receipt" element={<GoodsReceiptList />} />
    <Route path="/add-goods-receipt" element={<AddGoodsReceipt />} />
    <Route path="/goods-receipt/detail" element={<DetailGoodsReceipt />} />
    <Route path="/edit-goods-receipt" element={<EditGoodsReceipt />} />
  </>
);
