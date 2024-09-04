/* eslint-disable no-unsafe-optional-chaining */
import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "sonner";
import TemplateContainer from "../../components/organism/template-container";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "../../components/ui/drawer";

// Form
import DialogCustomInvoice from "../../components/organism/dialog/dialogCustomInvoice";
import DialogCheckout from "../../components/organism/dialog/dialogCheckout";

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
import { getAllCategory } from "../../services/category";

const arr = Array(40).fill(null);

const Home = () => {
  const { setActive } = useLoading();
  const [openMenu, setOpenMenu] = useState(false);
  const [openFilterCategory, setOpenFilterCategory] = useState(false);
  const [valueFilterCategory, setValueFilterCategory] = useState("");

  const [openModalDelete, setOpenModalDelete] = useState({
    id: null,
    open: false
  });

  const { order, decrementOrder, incrementOrder, handleDeleteOrder } = orderList();

  // Dialog Member
  const [dialogMember, setDialogMember] = useState(false);
  const [memberState, setMemberState] = useState({
    userName: "",
    phoneNumber: ""
  });

  // Query
  const productList = useQuery(
    ["get-product"],
    () => getAllProduct({ category: "", nameMember: "" }),
    {
      keepPreviousData: false
    }
  );

  const categoryList = useQuery(["get-category"], () => getAllCategory(), {
    keepPreviousData: false
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
            valueFilterCategory={valueFilterCategory}
            setOpenFilterCategory={() => setOpenFilterCategory(!openFilterCategory)}
            setValueFilterCategory={(val) => setValueFilterCategory(val)}
          />

          {/* Total Checkout Table / Mobile */}
          <div
            className={`w-full  border-t border-[#D9D9D9] flex flex-col gap-4 py-4 fixed px-4 left-0 bottom-0 z-10 bg-white lg:hidden`}>
            <div className="flex justify-between items-center">
              <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
              <p className="text-[#737373] text-lg font-semibold">Rp 60.000</p>
            </div>
            <div className="flex justify-between items-center">
              {/* Dialog Custom Invoice */}
              <DialogCustomInvoice />

              <div className="flex items-center gap-10">
                <DialogCheckout
                  dialogMember={dialogMember}
                  setDialogMember={() => setDialogMember(!dialogMember)}
                  submitNewMember={(value) => mutateNewMember.mutate(value)}
                  memberState={memberState}
                />
                <Drawer>
                  <DrawerTrigger>
                    <button className="px-3 py-2 bg-[#6853F0] text-base font-bold text-white rounded-full">
                      Check Detail
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-[80vh]">
                    <DrawerHeader>
                      <DrawerTitle>Daftar Orderan</DrawerTitle>
                    </DrawerHeader>
                    <div className="overflow-scroll no-scrollbar flex-1 flex flex-col gap-4 px-8">
                      {arr.map((_, index) => {
                        return (
                          <div className={`flex gap-4 border-b border-[#000]  pb-4`} key={index}>
                            <p>{index + 1}.</p>
                            <div className="flex gap-4 flex-1 items-center">
                              <div className="w-30 h-20">
                                <img
                                  src="https://asset.kompas.com/crops/MrdYDsxogO0J3wGkWCaGLn2RHVc=/84x60:882x592/750x500/data/photo/2021/11/17/61949959e07d3.jpg"
                                  alt="img"
                                  className="object-cover w-full h-full rounded-lg"
                                />
                              </div>
                              <div className="flex flex-col gap-4">
                                <p className="text-[#737373] font-semibold text-base">
                                  Nasi Goreng
                                </p>
                                <p className="text-[#6853F0] font-semibold text-base">Rp. 24.000</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 justify-center items-center">
                              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                                -
                              </button>
                              <div className="text-black font-bold text-lg">2</div>
                              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </div>

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

          <div
            className={`${!openMenu ? "w-[27%]" : "w-[24%]"}  border-t border-[#D9D9D9] flex flex-col gap-4 py-4 px-8 fixed bottom-0 z-10 bg-white`}>
            <div className="flex justify-between items-center">
              <p className="text-[#737373] text-lg font-semibold">Total Items :</p>
              <p className="text-[#737373] text-lg font-semibold">40 Items</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
              <p className="text-[#737373] text-lg font-semibold">Rp 60.000</p>
            </div>
            <div className="flex justify-between items-center">
              {/* Dialog Custom Invoice */}
              <DialogCustomInvoice />

              {/* Dialog Checkout  */}
              <DialogCheckout
                dialogMember={dialogMember}
                setDialogMember={() => setDialogMember(!dialogMember)}
                submitNewMember={(value) => mutateNewMember.mutate(value)}
                memberState={memberState}
              />
            </div>
          </div>
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
