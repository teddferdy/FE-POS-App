/* eslint-disable react/prop-types */
import React, { Fragment, useMemo } from "react";
import moment from "moment";

// Component
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

const OverviewLocationList = ({ data }) => {
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
              <TableHead className="text-center">Name Store</TableHead>
              <TableHead className="text-center">Phone Number</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Created By</TableHead>
              <TableHead className="text-center">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas.data?.map((items, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{items.nameStore || "-"}</TableCell>
                <TableCell className="text-center">{items.phoneNumber || "-"}</TableCell>
                <TableCell className="text-center">
                  {items.status ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Not Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">{items.createdBy || "-"}</TableCell>
                <TableCell className="text-center">
                  {moment(items.createdAt).format("DD/MM/YYYY hh:mm:ss") || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
  }, [data]);

  return <Fragment>{TABLE_LIST}</Fragment>;
};

export default OverviewLocationList;
