/* eslint-disable react/prop-types */
import React, { Fragment, useMemo } from "react";
import moment from "moment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

const OverviewMemberList = ({ data }) => {
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
              <TableHead className="text-center">Name Member</TableHead>
              <TableHead className="text-center">Phone Number</TableHead>
              <TableHead className="text-center">Location Member Created</TableHead>
              <TableHead className="text-center">Date Member Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas.data?.map((items, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{items.nameMember || "-"}</TableCell>
                <TableCell className="text-center">{items.phoneNumber || "-"}</TableCell>
                <TableCell className="text-center">{items.location || "-"}</TableCell>
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

export default OverviewMemberList;
