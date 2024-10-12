/* eslint-disable react/prop-types */
import React, { Fragment, useMemo } from "react";
import moment from "moment";

// Component
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

const OverviewProductList = ({ data }) => {
  const TABLE_LIST = useMemo(() => {
    if (data?.isLoading && data?.isFetching) {
      return null;
    }

    if (data?.data && data?.isSuccess) {
      const datas = data?.data;

      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Image</TableHead>
              <TableHead className="text-center">Name Product</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Option</TableHead>
              <TableHead className="text-center">Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Created By</TableHead>
              <TableHead className="text-center">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas.data?.map((items, index) => {
              // let optionProduct = "";
              // const listData = JSON?.parse(items.option);
              // listData?.map((items, index) => {
              //   optionProduct += `${items.nameSubCategory} ${index > 0 ? ", " : ""}`;
              // });

              const linkImage = generateLinkImageFromGoogleDrive(items?.image);
              return (
                <TableRow key={index}>
                  <TableCell className="text-center">
                    <img src={`${linkImage}`} alt={linkImage} className="w-full object-cover" />
                  </TableCell>
                  <TableCell className="text-center">{items.nameProduct || "-"}</TableCell>
                  <TableCell className="text-center">{items.category || "-"}</TableCell>
                  {/* <TableCell className="text-center">{optionProduct}</TableCell> */}
                  <TableCell className="text-center">{items.price || "-"}</TableCell>
                  <TableCell className="text-center">
                    {items.status ? <Badge isActive /> : <Badge isActive={false} />}
                  </TableCell>
                  <TableCell className="text-center">{items.createdBy || "-"}</TableCell>
                  <TableHead className="text-center">
                    {moment(items.createdAt).format("DD/MM/YYYY hh:mm:ss") || "-"}
                  </TableHead>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    }
  }, [data]);

  return <Fragment>{TABLE_LIST}</Fragment>;
};

export default OverviewProductList;
