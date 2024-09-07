/* eslint-disable no-undef */
import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ClipboardType } from "lucide-react";
import moment from "moment";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import DialogTypeSubCategory from "../../../components/organism/dialog/dialog-type-sub-category";
import { getAllSubCategory } from "../../../services/sub-category";
import DialogDeleteItem from "../../../components/organism/dialog/dialogDeleteItem";

import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";

import { deleteSubCategory } from "../../../services/sub-category";

const SubCategoryList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      accessorKey: "parentCategory",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name Product
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("parentCategory")}</div>
    },
    {
      accessorKey: "nameSubCategory",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name Product
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("nameSubCategory")}</div>
    },
    {
      accessorKey: "typeSubCategory",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            typeSubCategory
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => <DialogTypeSubCategory data={row} />
    },
    {
      accessorKey: "isMultiple",
      header: () => <div className="text-right">isMultiple</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("isMultiple")}</div>;
      }
    },
    {
      accessorKey: "createdBy",
      header: () => <div className="text-right">createdBy</div>,
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
        return (
          <div className="text-right font-medium">
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
          <div className="text-right font-medium">
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
                navigate(`/edit-sub-category/${row?.original?.id}`, {
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
                  id: row?.original?.id
                };
                mutateDeleteSubCategory.mutate(body);
              }}
            />
          </div>
        );
      }
    }
  ];

  // QUERY
  const allSubCategory = useQuery(["get-all-sub-caytegory"], () => getAllSubCategory(), {
    retry: 0,
    keepPreviousData: true
  });

  const mutateDeleteSubCategory = useMutation(deleteSubCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Sub Category"
        });
      }, 1000);
      setTimeout(() => {
        allLocation.refetch();
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

  const table = useReactTable({
    data: allSubCategory?.data?.data || [],
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
            onClick={() => navigate("/add-sub-category")}>
            <div className="flex items-center gap-4">
              <ClipboardType className="w-6 h-6" />
              <p>Add Sub Category</p>
            </div>
          </Button>
        </div>

        {/* List Member */}
        <div className="w-full h-[78%] overflow-scroll no-scrollbar">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter..."
              value={table.getColumn("parentCategory")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("parentCategory")?.setFilterValue(event.target.value)
              }
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

export default SubCategoryList;
