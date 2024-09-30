import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Percent } from "lucide-react";
import moment from "moment";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../../../components/ui/dropdown-menu";
import { getAllDiscount, deleteDiscount } from "../../../services/discount";
import DialogDeleteItem from "../../../components/organism/dialog/dialogDeleteItem";

import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";

const FILTER_BY = [
  {
    value: "description",
    name: "Description Discount"
  },
  {
    value: "percentage",
    name: "Percentage"
  }
];

const DiscountList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [filterBy, setFilterBy] = useState({
    value: "name",
    name: "Name Category"
  });

  // QUERY
  const allDiscount = useQuery(["get-all-discount"], () => getAllDiscount(), {
    retry: 0,
    keepPreviousData: true
  });

  const mutateDeleteDiscount = useMutation(deleteDiscount, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Discount"
        });
      }, 1000);
      setTimeout(() => {
        allDiscount.refetch();
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const columns = [
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <div className="justify-center flex">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Description Discount
              {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("description")}</div>
    },
    {
      accessorKey: "percentage",
      header: ({ column }) => {
        return (
          <div className="justify-center flex">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              percentage
              {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("percentage")}</div>
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => {
        return (
          <div className="justify-center flex">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Is Active
              {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="lowercase text-center">
            {row.getValue("isActive") ? (
              <Badge variant="secondary">Active</Badge>
            ) : (
              <Badge variant="destructive">Not Active</Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => {
        return (
          <div className="justify-center flex">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Created By
              {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("createdBy")}</div>;
      }
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="justify-center flex">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Created At
              {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {moment(row.getValue("createdAt")).format("DD/MM/YYYY hh:mm:ss") || "-"}
          </div>
        );
      }
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-right">Updated At</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {moment(row.getValue("updatedAt")).format("DD/MM/YYYY hh:mm:ss") || "-"}
          </div>
        );
      }
    },
    {
      accessorKey: "action",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-6">
            <Button
              className="h-8 w-full p-4"
              onClick={() =>
                navigate(`/edit-discount/${row?.original?.id}`, {
                  state: {
                    data: row.original
                  }
                })
              }>
              <span>Edit</span>
              {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
            </Button>
            <DialogDeleteItem
              actionDelete={() => {
                const body = {
                  id: `${row?.original?.id}`,
                  description: row.getValue("description")
                };
                mutateDeleteDiscount.mutate(body);
              }}
            />
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: allDiscount?.data?.data || [],
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
      <div className="flex justify-end mb-6 p-4">
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-discount")}>
          <div className="flex items-center gap-4">
            <Percent className="w-6 h-6" />
            <p>Add Discount</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      <div className="w-full p-4">
        <div className="flex flex-col md:flex-row gap-10 py-4">
          <Input
            placeholder="Search..."
            value={table.getColumn(filterBy.value)?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn(filterBy.value)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex gap-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{filterBy.name}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {FILTER_BY.map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.value === filterBy.value}
                      onCheckedChange={() => setFilterBy(column)}>
                      {column.name}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Show / Hide Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
    </TemplateContainer>
  );
};

export default DiscountList;
