import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translationSelect } from "./state/translation";
import { useCookies } from "react-cookie";

// Auth
import Login from "./page/auth/login";
import Register from "./page/auth/register";
import ResetPassword from "./page/auth/reset-password";
import EditProfile from "./page/auth/edit-profile";

// Cashier
import ListProduct from "./page/cashier/list-product"; // List Product Cashier
// import MemberCashier from "./page/cashier/member-cashier";

// Admin
import Product from "./page/admin/product";
import LocationCardList from "./page/super-admin/location/location-card-list";
import Invoice from "./page/admin/invoice";
import SubCategoryList from "./page/admin/product/sub-category";
import OverviewPage from "./page/admin/overview";
import CategoryList from "./page/admin/product/category";
import LocationList from "./page/super-admin/location";
import MemberList from "./page/admin/member";
import ProductList from "./page/admin/product/product";
import DiscountList from "./page/admin/discount";
import ShiftList from "./page/admin/shift";
import TypePaymentList from "./page/admin/type-payment";
import SocialMediaList from "./page/admin/social-media";
import InvoiceLogoList from "./page/admin/invoice/invoice-logo";
import InvoiceSocialMediaList from "./page/admin/invoice/invoice-social-media";
import InvoiceFooterList from "./page/admin/invoice/invoice-footer";

// Super Admin
import UserListByLocation from "./page/super-admin/my-teams/user";
import PositionList from "./page/super-admin/my-teams/position";
import RoleList from "./page/super-admin/my-teams/role";
import ProductListByLocation from "./page/super-admin/product-by-outlet";
import DiscountListByOutlet from "./page/super-admin/discount-list-by-outlet";

// Form
import FormCategory from "./page/admin/product/category/formCategory";
import FormLocation from "./page/super-admin/location/formLocation";
import FormProduct from "./page/admin/product/product/formProduct";
import FormSubCategory from "./page/admin/product/sub-category/form-subcategory";
import FormDiscount from "./page/admin/discount/formDiscount";
import FormShift from "./page/admin/shift/formShift";
import FormTypePayment from "./page/admin/type-payment/formTypePayment";
import FormSocialMedia from "./page/admin/social-media/formSocialMedia";
import FormInvoiceLogo from "./page/admin/invoice/invoice-logo/formInvoiceLogo";
import FormInvoiceSocialMedia from "./page/admin/invoice/invoice-social-media/formInvoiceSocialMedia";
import FormInvoiceFooter from "./page/admin/invoice/invoice-footer/formInvoiceFooter";
import FormPosition from "./page/super-admin/my-teams/position/formPosition";
import FormRole from "./page/super-admin/my-teams/role/formRole";

function App() {
  const { i18n } = useTranslation();

  const { translation } = translationSelect();
  const [cookie] = useCookies();

  useEffect(() => {
    if (translation) {
      i18n.changeLanguage(translation);
    }
  }, [translation]);

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="*" element={<QuaifiedPolicies policyTypes={false} />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/edit-profile"
          element={cookie.token ? <EditProfile /> : <Navigate to="/" />}
        />
        <Route path="/home" element={cookie.token ? <ListProduct /> : <Navigate to="/" />} />
        {/* <Route
          path="/membership"
          element={cookie.token ? <MemberCashier /> : <Navigate to="/" />}
        /> */}
        <Route path="/admin-page" element={cookie.token ? <OverviewPage /> : <Navigate to="/" />} />
        <Route
          path="/category-list"
          element={cookie.token ? <CategoryList /> : <Navigate to="/" />}
        />
        <Route
          path="/location-list"
          element={cookie.token ? <LocationList /> : <Navigate to="/" />}
        />
        <Route path="/member-list" element={cookie.token ? <MemberList /> : <Navigate to="/" />} />
        <Route
          path="/product-list"
          element={cookie.token ? <ProductList /> : <Navigate to="/" />}
        />
        <Route
          path="/sub-category-list"
          element={cookie.token ? <SubCategoryList /> : <Navigate to="/" />}
        />
        <Route
          path="/discount-list"
          element={cookie.token ? <DiscountList /> : <Navigate to="/" />}
        />
        <Route path="/shift-list" element={cookie.token ? <ShiftList /> : <Navigate to="/" />} />
        <Route
          path="/type-payment-list"
          element={cookie.token ? <TypePaymentList /> : <Navigate to="/" />}
        />
        <Route
          path="/social-media-list"
          element={cookie.token ? <SocialMediaList /> : <Navigate to="/" />}
        />
        <Route
          path="/logo-invoice-list"
          element={cookie.token ? <InvoiceLogoList /> : <Navigate to="/" />}
        />
        <Route
          path="/social-media-invoice-list"
          element={cookie.token ? <InvoiceSocialMediaList /> : <Navigate to="/" />}
        />
        <Route
          path="/footer-invoice-list"
          element={cookie.token ? <InvoiceFooterList /> : <Navigate to="/" />}
        />

        {/* Location Available */}
        <Route
          path="/invoice-by-outlet"
          element={cookie.token ? <LocationCardList /> : <Navigate to="/" />}
        />
        <Route
          path="/product-by-outlet"
          element={cookie.token ? <LocationCardList /> : <Navigate to="/" />}
        />
        <Route
          path="/my-teams-location-available"
          element={cookie.token ? <LocationCardList /> : <Navigate to="/" />}
        />
        <Route
          path="/discount-by-outlet"
          element={cookie.token ? <LocationCardList /> : <Navigate to="/" />}
        />

        {/* End Location Available */}
        <Route
          path="/my-teams-user"
          element={cookie.token ? <UserListByLocation /> : <Navigate to="/" />}
        />

        <Route
          path="/product-list-by-outlet"
          element={cookie.token ? <ProductListByLocation /> : <Navigate to="/" />}
        />

        <Route
          path="/position-list"
          element={cookie.token ? <PositionList /> : <Navigate to="/" />}
        />
        <Route path="/role-list" element={cookie.token ? <RoleList /> : <Navigate to="/" />} />
        <Route path="/product-page" element={cookie.token ? <Product /> : <Navigate to="/" />} />
        <Route path="/invoice-page" element={cookie.token ? <Invoice /> : <Navigate to="/" />} />
        <Route
          path="/discount-list-by-outlet"
          element={cookie.token ? <DiscountListByOutlet /> : <Navigate to="/" />}
        />

        {/* Add Routes */}
        <Route
          path="/add-category"
          element={cookie.token ? <FormCategory /> : <Navigate to="/" />}
        />
        <Route
          path="/add-location"
          element={cookie.token ? <FormLocation /> : <Navigate to="/" />}
        />
        <Route path="/add-product" element={cookie.token ? <FormProduct /> : <Navigate to="/" />} />
        <Route
          path="/add-sub-category"
          element={cookie.token ? <FormSubCategory /> : <Navigate to="/" />}
        />
        <Route
          path="/add-discount"
          element={cookie.token ? <FormDiscount /> : <Navigate to="/" />}
        />
        <Route path="/add-shift" element={cookie.token ? <FormShift /> : <Navigate to="/" />} />
        <Route
          path="/add-type-payment"
          element={cookie.token ? <FormTypePayment /> : <Navigate to="/" />}
        />
        <Route
          path="/add-social-media"
          element={cookie.token ? <FormSocialMedia /> : <Navigate to="/" />}
        />
        <Route
          path="/add-invoice-logo"
          element={cookie.token ? <FormInvoiceLogo /> : <Navigate to="/" />}
        />
        <Route
          path="/add-invoice-social-media"
          element={cookie.token ? <FormInvoiceSocialMedia /> : <Navigate to="/" />}
        />
        <Route
          path="/add-invoice-footer"
          element={cookie.token ? <FormInvoiceFooter /> : <Navigate to="/" />}
        />
        <Route
          path="/add-position"
          element={cookie.token ? <FormPosition /> : <Navigate to="/" />}
        />
        <Route path="/add-role" element={cookie.token ? <FormRole /> : <Navigate to="/" />} />

        {/* Edit */}
        <Route
          path="/edit-category/:id"
          element={cookie.token ? <FormCategory /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-location/:id"
          element={cookie.token ? <FormLocation /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-product/:id"
          element={cookie.token ? <FormProduct /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-sub-category/:id"
          element={cookie.token ? <FormSubCategory /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-discount/:id"
          element={cookie.token ? <FormDiscount /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-shift/:id"
          element={cookie.token ? <FormShift /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-type-payment/:id"
          element={cookie.token ? <FormTypePayment /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-social-media/:id"
          element={cookie.token ? <FormSocialMedia /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-invoice-logo/:id"
          element={cookie.token ? <FormInvoiceLogo /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-invoice-social-media/:id"
          element={cookie.token ? <FormInvoiceSocialMedia /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-invoice-footer/:id"
          element={cookie.token ? <FormInvoiceFooter /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-position/:id"
          element={cookie.token ? <FormPosition /> : <Navigate to="/" />}
        />
        <Route path="/edit-role/:id" element={cookie.token ? <FormRole /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
