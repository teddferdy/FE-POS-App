import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "sonner";
import TemplateContainer from "../../components/organism/template-container";

// Component
import DialogCheckout from "../../components/organism/dialog/dialogCheckout";
import CardTotalMobile from "../../components/organism/card/card-total-mobile";
import CardTotalWeb from "../../components/organism/card/card-total-web";
import { useLoading } from "../../components/organism/loading";
import { addMember } from "../../services/member";
import DialogDeleteOrderList from "../../components/organism/dialog/dialog-delete-order-list";
import DialogMember from "../../components/organism/dialog/dialogMember";
import CategoryList from "../../components/organism/list/category-list";
import ProductList from "../../components/organism/list/product-list";

import OrderList from "../../components/organism/list/order-list";

// State
import { categorySelect } from "../../state/category";
import { invoice } from "../../state/invoice";

// Services
import { getAllProduct } from "../../services/product";
import { orderList } from "../../state/order-list";
import { getAllCategory } from "../../services/category";
import { postCheckoutItem, cancelCheckoutItem, checkoutItem } from "../../services/checkout";

const Home = () => {
  const { setActive } = useLoading();
  const { category, updateCategory } = categorySelect();
  const { updateInvoice, cancelInvoice, data } = invoice();
  const [hasMember, setHasMember] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openFilterCategory, setOpenFilterCategory] = useState(false);

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
    handleUpdateOptionProduct,
    resetOrder
  } = orderList();

  // Dialog Member
  const [dialogMember, setDialogMember] = useState(false);
  const [memberState, setMemberState] = useState({
    userName: "",
    phoneNumber: ""
  });

  // Query
  const productList = useQuery(
    ["get-product", category],
    () =>
      getAllProduct({
        category: category === "All" ? "" : category.toLowerCase(),
        nameProduct: ""
      }),
    {
      keepPreviousData: false,
      enabled: !!category
    }
  );

  const categoryList = useQuery(["get-category"], () => getAllCategory(), {
    keepPreviousData: true
  });

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
        updateInvoice(data);
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
        cancelInvoice();
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
        resetOrder();
        cancelInvoice();
        setActive(null, null);
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
    <TemplateContainer setOpenMenu={(val) => setOpenMenu(val)} openMenu={openMenu}>
      <div className="flex h-screen border-t-2 border-[#ffffff10] relative">
        <div className="flex-1 overflow-hidden py-10 flex-col flex bg-gray-200 h-screen px-4">
          {/* Slider Category When Desktop Resolution */}
          <CategoryList
            categoryList={categoryList}
            openFilterCategory={openFilterCategory}
            valueFilterCategory={category}
            setOpenFilterCategory={() => setOpenFilterCategory(!openFilterCategory)}
            setValueFilterCategory={(val) => updateCategory(val)}
          />

          {/* Total Checkout Table / Mobile */}
          <CardTotalMobile
            // Order
            order={order}
            option={option}
            handleUpdateOptionProduct={handleUpdateOptionProduct}
            decrementOrder={decrementOrder}
            incrementOrder={incrementOrder}
            setOpenModalDelete={(val) => setOpenModalDelete(val)}
            // End Order
            openMenu={openMenu}
            dialogMember={dialogMember}
            setDialogMember={() => setDialogMember(!dialogMember)}
            submitNewMember={(value) => mutateNewMember.mutate(value)}
            memberState={memberState}
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
            order={order}
            openMenu={openMenu}
            handleCheckout={(payload) => mutateAddCartCheckoutItem.mutate(payload)}
            // dialogMember={dialogMember}
            // setDialogMember={() => setDialogMember(!dialogMember)}
            // submitNewMember={(value) => mutateNewMember.mutate(value)}
            // memberState={memberState}
          />
        </div>
      </div>

      <DialogCheckout
        data={data}
        showDialog={data?.open}
        handleCloseDialog={() => mutateCancelItem.mutate(data)}
        hasMember={hasMember}
        setHasMember={(val) => setHasMember(val)}
        handleCheckout={() => {
          console.log("data =>", data);

          const body = {
            id: data.id,
            invoice: data.invoice,
            dateOrder: data.dateOrder,
            totalPrice: data.totalPrice,
            cashierName: data.cashierName,
            totalQuantity: data.totalItems,
            customerName: hasMember ? "" : "",
            customerPhoneNumber: hasMember ? "" : "",
            typePayment: "QRIS",
            modifiedBy: data.cashierName
          };
          console.log("BODY =>", body);

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
    </TemplateContainer>
  );
};

export default Home;
