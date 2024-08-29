/* eslint-disable no-constant-binary-expression */
import React, { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
import {
  //   ColumnDef,
  //   ColumnFiltersState,
  //   SortingState,
  //   VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { MapPinPlus } from "lucide-react";

import { Button } from "../../../components/ui/button";

import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import { useQuery } from "react-query";
import { getAllLocation } from "../../../services/location";

import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";

export const columns = [
  {
    accessorKey: "nameStore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name Store
          {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("nameStore")}</div>
  },
  {
    accessorKey: "address",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          address
          {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("address")}</div>
  },
  {
    accessorKey: "detailLocation",
    header: () => <div className="text-right">Detail Location</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("detailLocation")}</div>;
    }
  },
  {
    accessorKey: "phoneNumber",
    header: () => <div className="text-right">Phone Number</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("phoneNumber")}</div>;
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
          {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("status")}</div>;
    }
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created By
          {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("createdBy")}</div>;
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created At
          {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("createdAt")}</div>;
    }
  },
  {
    accessorKey: "modifiedBy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Modified By
          {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("modifiedBy")}</div>;
    }
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-right">Updated At</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue("updatedAt")}</div>;
    }
  },
  {
    accessorKey: "action",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => {
      console.log("INI ROW", row);

      return (
        <div className="flex flex-col">
          <Button className="h-8 w-8 p-0">
            <span>Edit</span>
            {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
          </Button>
          <Button className="h-8 w-8 p-0">
            <span>Delete</span>
            {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
          </Button>
        </div>
      );
    }
  }
];

const LocationList = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const allLocation = useQuery(["get-all-location"], () => getAllLocation(), {
    retry: 0,
    keepPreviousData: true
  });

  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: allLocation?.data?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  return (
    <TemplateContainer>
      <div className="border-t-2 border-[#ffffff10] overflow-scroll p-4 flex flex-col h-screen">
        <div className="flex justify-end mb-6">
          <Button
            className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
            onClick={() => navigate("/add-location")}>
            <div className="flex items-center gap-4">
              <MapPinPlus className="w-6 h-6" />
              <p>Add Location</p>
            </div>
          </Button>
        </div>

        {/* List Member */}
        <div className="w-full h-[78%] overflow-scroll no-scrollbar">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter..."
              value={table.getColumn("nameStore")?.getFilterValue() ?? ""}
              onChange={(event) => table.getColumn("nameStore")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TemplateContainer>
  );
};

export default LocationList;
