/* eslint-disable react/no-unknown-property */
import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import TemplateHome from "../../components/organism/template";

import AddProduct from "../../components/molecule/form/add-product";

const AdminPage = () => {
  return (
    <TemplateHome classNameContainer="overflow-auto" classNameContainerSideBar="h-screen">
      <div className="flex h-screen border-t-2 border-[#ffffff10] m-10  shadow-2xl md:ml-32 rounded-lg overflow-auto">
        <Tabs className="w-full ">
          <TabList>
            <Tab>Tambah Product</Tab>
            <Tab>Tambah Category</Tab>
            <Tab>Acc User</Tab>
          </TabList>

          <TabPanel>
            <AddProduct />
          </TabPanel>
          <TabPanel>
            <h2>Any content 2</h2>
          </TabPanel>
        </Tabs>
      </div>
    </TemplateHome>
  );
};

export default AdminPage;
