import React from "react";
import { Route } from "react-router-dom";

// Expense Category
const ExpenseCategoryList = React.lazy(() => import("@/page/expense-category/ExpenseCategoryList"));
const AddExpenseCategory = React.lazy(() => import("@/page/expense-category/AddExpenseCategory"));
const EditExpenseCategory = React.lazy(() => import("@/page/expense-category/EditExpenseCategory"));
const ExpenseCategoryDetail = React.lazy(
  () => import("@/page/expense-category/ExpenseCategoryDetail")
);

// Expense
const ExpenseList = React.lazy(() => import("@/page/expense/ExpenseList"));
const AddExpense = React.lazy(() => import("@/page/expense/AddExpense"));
const EditExpense = React.lazy(() => import("@/page/expense/EditExpense"));
const DetailExpense = React.lazy(() => import("@/page/expense/DetailExpense"));

// Accounts Receivable
const AccountsReceivableList = React.lazy(
  () => import("@/page/accounts-receivable/AccountsReceivableList")
);
const AccountsReceivableDetail = React.lazy(
  () => import("@/page/accounts-receivable/AccountsReceivableDetail")
);
const ARPaymentList = React.lazy(() => import("@/page/accounts-receivable/ARPaymentList"));

// Cash Register
const CashRegisterOpenClose = React.lazy(
  () => import("@/page/cash-register/CashRegisterOpenClose")
);
const CashRegisterCurrent = React.lazy(() => import("@/page/cash-register/CashRegisterCurrent"));
const CashRegisterHistory = React.lazy(() => import("@/page/cash-register/CashRegisterHistory"));
const CashRegisterDetail = React.lazy(() => import("@/page/cash-register/CashRegisterDetail"));

// Tax Config
const TaxConfigList = React.lazy(() => import("@/page/tax-config/TaxConfigList"));
const AddTaxConfig = React.lazy(() => import("@/page/tax-config/AddTaxConfig"));
const EditTaxConfig = React.lazy(() => import("@/page/tax-config/EditTaxConfig"));
const DetailTaxConfig = React.lazy(() => import("@/page/tax-config/DetailTaxConfig"));

export const financeRoutes = (
  <>
    <Route path="/expense-category" element={<ExpenseCategoryList />} />
    <Route path="/add-expense-category" element={<AddExpenseCategory />} />
    <Route path="/edit-expense-category" element={<EditExpenseCategory />} />
    <Route path="/detail-expense-category" element={<ExpenseCategoryDetail />} />

    <Route path="/expense" element={<ExpenseList />} />
    <Route path="/add-expense" element={<AddExpense />} />
    <Route path="/edit-expense" element={<EditExpense />} />
    <Route path="/detail-expense" element={<DetailExpense />} />

    <Route path="/accounts-receivable" element={<AccountsReceivableList />} />
    <Route path="/accounts-receivable/detail" element={<AccountsReceivableDetail />} />
    <Route path="/ar-payment" element={<ARPaymentList />} />

    <Route path="/cash-register/open-close" element={<CashRegisterOpenClose />} />
    <Route path="/cash-register/current" element={<CashRegisterCurrent />} />
    <Route path="/cash-register/history" element={<CashRegisterHistory />} />
    <Route path="/cash-register/history/detail" element={<CashRegisterDetail />} />

    <Route path="/tax-list" element={<TaxConfigList />} />
    <Route path="/add-tax" element={<AddTaxConfig />} />
    <Route path="/edit-tax" element={<EditTaxConfig />} />
    <Route path="/detail-tax" element={<DetailTaxConfig />} />
  </>
);
