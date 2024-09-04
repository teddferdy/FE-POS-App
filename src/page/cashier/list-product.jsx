/* eslint-disable no-unsafe-optional-chaining */
import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "sonner";
import TemplateContainer from "../../components/organism/template-container";

// Form
import CardTotalMobile from "../../components/organism/card/card-total-mobile";
import CardTotalWeb from "../../components/organism/card/card-total-web";
import { useLoading } from "../../components/organism/loading";
import { addMember } from "../../services/member";
import DialogDeleteOrderList from "../../components/organism/dialog/dialog-delete-order-list";
import DialogMember from "../../components/organism/dialog/dialogMember";
import CategoryList from "../../components/organism/list/category-list";
import ProductList from "../../components/organism/list/product-list";

import OrderList from "../../components/organism/list/order-list";

// State / Services
import { getAllProduct } from "../../services/product";
import { orderList } from "../../state/order-list";
import { categorySelect } from "../../state/category";
import { getAllCategory } from "../../services/category";

const Home = () => {
  const { setActive } = useLoading();
  const [openMenu, setOpenMenu] = useState(false);
  const [openFilterCategory, setOpenFilterCategory] = useState(false);

  const [openModalDelete, setOpenModalDelete] = useState({
    id: null,
    open: false
  });

  const { order, decrementOrder, incrementOrder, handleDeleteOrder } = orderList();
  const { category, updateCategory } = categorySelect();

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
            order={order}
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
            decrementOrder={decrementOrder}
            incrementOrder={incrementOrder}
            setOpenModalDelete={(val) => setOpenModalDelete(val)}
          />

          <CardTotalWeb
            order={order}
            openMenu={openMenu}
            dialogMember={dialogMember}
            setDialogMember={() => setDialogMember(!dialogMember)}
            submitNewMember={(value) => mutateNewMember.mutate(value)}
            memberState={memberState}
          />
        </div>
      </div>

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
