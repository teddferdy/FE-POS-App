import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "sonner";
import TemplateContainer from "../../components/organism/template-container";
import { useCookies } from "react-cookie";

// Component
import DialogCheckout from "../../components/organism/dialog/dialogCheckout";
import CardTotalMobile from "../../components/organism/card/card-total-mobile";
import CardTotalWeb from "../../components/organism/card/card-total-web";
import { useLoading } from "../../components/organism/loading";
import { addMember } from "../../services/member";
import DialogInvoice from "../../components/organism/dialog/dialog-invoice";
import DialogDeleteOrderList from "../../components/organism/dialog/dialog-delete-order-list";
import DialogMember from "../../components/organism/dialog/dialogMember";
import CategoryList from "../../components/organism/list/category-list";
import ProductList from "../../components/organism/list/product-list";
import OrderList from "../../components/organism/list/order-list";

// State
import { invoice } from "../../state/invoice";
import { categorySelect } from "../../state/category";
import { checkout } from "../../state/checkout";
import { orderList } from "../../state/order-list";

// Services
import { getAllProduct } from "../../services/product";
import { getAllCategory } from "../../services/category";
import { postCheckoutItem, cancelCheckoutItem, checkoutItem } from "../../services/checkout";
import {
  getAllInvoiceLogoByActive,
  getAllInvoiceSocialMediaByActive,
  getAllInvoiceFooterByActive
} from "../../services/invoice";

const Home = () => {
  const { setActive } = useLoading();
  const [cookie] = useCookies(["user"]);
  console.log("cookie =>", cookie);

  const { category, updateCategory } = categorySelect();
  const { updateCheckout, cancelCheckout, data } = checkout();
  const { data: dataInvoice, resetInvoice, updateInvoiceNumber, updateInvoice } = invoice();
  const [hasMember, setHasMember] = useState(false);

  const [openModalDelete, setOpenModalDelete] = useState({
    id: null,
    open: false
  });

  const {
    order,
    option,
    decrementOrder,
    incrementOrder,
    handleDeleteOrder,
    handleUpdateOptionProduct
    // resetOrder
  } = orderList();

  // Dialog Member
  const [dialogMember, setDialogMember] = useState(false);
  const [memberState, setMemberState] = useState({
    userName: "",
    phoneNumber: ""
  });

  // Type Payment
  const [value, setValue] = useState("");
  // Type Order
  const [typeOrder, setTypeOrder] = useState("Dine-in");

  // Query

  const getInvoiceLogo = useQuery(
    ["get-invoice-logo", category],
    () => getAllInvoiceLogoByActive({ location: cookie?.user?.store }),
    {
      keepPreviousData: true,
      enabled: dataInvoice?.open
    }
  );

  const getInvoiceFooter = useQuery(
    ["get-invoice-footer", category],
    () => getAllInvoiceFooterByActive({ location: cookie?.user?.store }),
    {
      keepPreviousData: true,
      enabled: dataInvoice?.open
    }
  );

  const getInvoiceSocialMedia = useQuery(
    ["get-invoice-social-medi", category],
    () => getAllInvoiceSocialMediaByActive({ location: cookie?.user?.store }),
    {
      keepPreviousData: true,
      enabled: dataInvoice?.open
    }
  );

  const productList = useQuery(
    ["get-product", category],
    () =>
      getAllProduct({
        category: category || "",
        nameProduct: "",
        location: cookie?.user?.store
      }),
    {
      keepPreviousData: false,
      enabled: !dataInvoice?.open
    }
  );

  const categoryList = useQuery(
    ["get-category"],
    () => getAllCategory({ location: cookie?.user?.store }),
    {
      keepPreviousData: true,
      enabled: !dataInvoice?.open
    }
  );

  const mutateNewMember = useMutation(addMember, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Success add new member"
        });
      }, 1000);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Login", {
          description: err.message || "Failed to add new member"
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateAddCartCheckoutItem = useMutation(postCheckoutItem, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      const { data } = success;
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Success add Cart"
        });
      }, 1000);
      setTimeout(() => {
        updateCheckout(data);
        updateInvoiceNumber({
          noInvoice: data?.invoice,
          cashierName: data?.cashierName
        });
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message || "Failed to add Cart"
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateCancelItem = useMutation(cancelCheckoutItem, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        cancelCheckout();
        resetInvoice();
        setActive(null, null);
      }, 1000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message || "Failed to Cancel Item"
        });
      }, 1000);
      setTimeout(() => {
        setActive(null, null);
      }, 15000);
    }
  });

  const mutateCheckoutItem = useMutation(checkoutItem, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Success Checkout Item"
        });
      }, 1000);
      setTimeout(() => {
        // resetOrder();
        cancelCheckout();
        setActive(null, null);
        updateInvoice({
          typeOrder: typeOrder,
          isMember: hasMember,
          typePayment: value,
          memberName: memberState.userName,
          memberPhoneNumber: memberState.phoneNumber
        });

        // tambah Function Buat Print Invoice
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message || "Failed to Cancel Item"
        });
      }, 1000);
      setTimeout(() => {
        setActive(null, null);
      }, 15000);
    }
  });

  return (
    <TemplateContainer
      rootContainer="overflow-scroll h-screen"
      childrenContainer="h-screen overflow-scroll">
      <div className="flex h-screen border-t-2 border-[#ffffff10] relative">
        <div className="flex-1 py-10 flex-col flex bg-gray-200 h-screen px-4 w-full">
          {/* Slider Category When Desktop Resolution */}
          <CategoryList
            categoryList={categoryList}
            valueFilterCategory={category}
            setValueFilterCategory={(val) => {
              updateCategory(val);
            }}
          />

          {/* Total Checkout Table / Mobile */}
          <CardTotalMobile
            cookie={cookie}
            order={order}
            option={option}
            handleUpdateOptionProduct={handleUpdateOptionProduct}
            decrementOrder={decrementOrder}
            incrementOrder={incrementOrder}
            setOpenModalDelete={(val) => setOpenModalDelete(val)}
            handleCheckout={(payload) => mutateAddCartCheckoutItem.mutate(payload)}
          />

          {/* List Items */}
          <ProductList productList={productList} />
        </div>

        {/* Total Checkout */}
        <div className="hidden lg:flex md:flex-[0.4] shadow-lg py-12 flex-col justify-between gap-6 bg-white relative">
          <h3 className="text-2xl font-semibold text-[#737373] px-8">Daftar Orderan :</h3>
          <OrderList
            productList={productList}
            order={order}
            option={option}
            handleUpdateOptionProduct={handleUpdateOptionProduct}
            decrementOrder={decrementOrder}
            incrementOrder={incrementOrder}
            setOpenModalDelete={(val) => setOpenModalDelete(val)}
          />

          <CardTotalWeb
            cookie={cookie}
            order={order}
            handleCheckout={(payload) => mutateAddCartCheckoutItem.mutate(payload)}
          />
        </div>
      </div>
      <DialogCheckout
        order={order}
        value={value}
        setValue={(val) => setValue(val)}
        data={data}
        showDialog={data?.open}
        typeOrder={typeOrder}
        setTypeOrder={(val) => setTypeOrder(val)}
        memberState={memberState}
        handleCloseDialog={() => {
          const body = {
            ...data,
            store: cookie?.user?.store
          };
          mutateCancelItem.mutate(body);
        }}
        submitNewMember={(value) => mutateNewMember.mutate(value)}
        hasMember={hasMember}
        handleSearchDialog={() => setDialogMember(true)}
        setHasMember={(val) => setHasMember(val)}
        handleCheckout={() => {
          const body = {
            order: order,
            id: data?.id,
            invoice: data?.invoice,
            dateOrder: data?.dateOrder,
            dateCheckout: new Date(),
            totalPrice: data?.totalPrice,
            cashierName: data?.cashierName,
            totalQuantity: data?.totalItems,
            customerName: hasMember ? "" : "",
            customerPhoneNumber: hasMember ? "" : "",
            typePayment: "QRIS",
            modifiedBy: data?.cashierName,
            store: cookie?.user?.store
          };
          mutateCheckoutItem.mutate(body);
        }}
      />
      <DialogMember
        dialogMember={dialogMember}
        setDialogMember={() => setDialogMember(!dialogMember)}
        selectMember={(values) => {
          setDialogMember(!dialogMember);
          setMemberState({
            userName: values?.nameMember,
            phoneNumber: values?.phoneNumber
          });
        }}
      />
      <DialogDeleteOrderList
        open={openModalDelete.open}
        onClose={() =>
          setOpenModalDelete({
            id: null,
            open: false
          })
        }
        deleteItems={() => {
          handleDeleteOrder(openModalDelete);
          setOpenModalDelete({
            id: null,
            open: false
          });
        }}
      />

      <DialogInvoice
        order={order}
        open={dataInvoice.open}
        data={dataInvoice}
        dataInvoiceLogo={getInvoiceLogo?.data?.data?.[0] || []}
        dataInvoiceFooter={getInvoiceFooter?.data?.data?.[0] || []}
        dataInvoiceSocialMedia={getInvoiceSocialMedia?.data?.data?.[0] || []}
      />
    </TemplateContainer>
  );
};

export default Home;
