/* eslint-disable react/prop-types */
import React, { Fragment, useMemo } from "react";

// Component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

const OverviewBestSellingList = ({ data }) => {
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
              <TableHead className="text-center">Total Selling</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas.data?.map((items, index) => {
              const linkImage = generateLinkImageFromGoogleDrive(items?.image);
              return (
                <TableRow key={index}>
                  <TableCell className="flex justify-center">
                    <img src={`${linkImage}`} alt={linkImage} className="w-2/4 object-cover" />
                  </TableCell>
                  <TableCell className="text-center">{items.nameProduct || "-"}</TableCell>
                  <TableCell className="text-center">{items.totalSelling || "-"}</TableCell>
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

export default OverviewBestSellingList;
