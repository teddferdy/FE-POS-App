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
import { Utensils } from "lucide-react";
import moment from "moment";
import {
  // useMutation,
  useQuery
} from "react-query";
import { useNavigate } from "react-router-dom";

// Component
import { Button } from "../../../components/ui/button";
// import { toast } from "sonner";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import DialogDeleteItem from "../../../components/organism/dialog/dialogDeleteItem";
import TemplateContainer from "../../../components/organism/template-container";

// import { useLoading } from "../../../components/organism/loading";

// Service
import { getAllProductTable } from "../../../services/product";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

const ProductList = () => {
  const navigate = useNavigate();
  // const { setActive } = useLoading();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      accessorKey: "image",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Image
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => {
        const linkImage = generateLinkImageFromGoogleDrive(row?.original?.image);

        return <img src={`${linkImage}`} alt={linkImage} className="w-full object-cover" />;
      }
    },
    {
      accessorKey: "nameProduct",
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
      cell: ({ row }) => <div className="text-center capitalize">{row.getValue("nameProduct")}</div>
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Category
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase text-center">{row.getValue("category")}</div>
    },
    {
      accessorKey: "description",
      header: () => <div className="text-center">Description</div>,
      cell: ({ row }) => {
        return <div className="text-center font-medium">{row.getValue("description")}</div>;
      }
    },
    {
      accessorKey: "price",
      header: () => <div className="text-center">Price</div>,
      cell: ({ row }) => {
        return <div className="text-center font-medium">{row.getValue("price")}</div>;
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
          </Button>
        );
      },
      cell: ({ row }) => {
        console.log('row.getValue("status")  =>', row.getValue("status"));
        return (
          <div className="text-center font-medium">
            {row.getValue("status") ? (
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Created By
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-center font-medium">{row.getValue("createdBy") || "-"}</div>;
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
          <div className="text-center font-medium">
            {moment(row.getValue("createdAt")).format("DD/MM/YYYY hh:mm:ss") || "-"}
          </div>
        );
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
        return <div className="text-center font-medium">{row.getValue("modifiedBy") || "-"}</div>;
      }
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-center">Updated At</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {moment(row.getValue("updatedAt")).format("DD/MM/YYYY hh:mm:ss") || "-"}
          </div>
        );
      }
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-6">
            <Button
              className="h-8 w-full p-4"
              onClick={() =>
                navigate(`/edit-location/${row?.original?.id}`, {
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
                // const body = {
                //   id: row?.original?.id,
                //   nameProduct: row.getValue("nameProduct")
                // };
                // mutateDeleteLocation.mutate(body);
              }}
            />
          </div>
        );
      }
    }
  ];

  // QUERY
  const allProduct = useQuery(["get-all-product-table"], () => getAllProductTable(), {
    retry: 0,
    keepPreviousData: true
  });

  // const mutateDeleteLocation = useMutation(deleteLocation, {
  //   onMutate: () => setActive(true, null),
  //   onSuccess: () => {
  //     setActive(false, "success");
  //     setTimeout(() => {
  //       toast.success("Success", {
  //         description: "Successfull, Delete Location"
  //       });
  //     }, 1000);
  //     setTimeout(() => {
  //       allLocation.refetch();
  //       setActive(null, null);
  //     }, 2000);
  //   },
  //   onError: (err) => {
  //     setActive(false, "error");
  //     setTimeout(() => {
  //       toast.error("Failed", {
  //         description: err.message
  //       });
  //     }, 1500);
  //     setTimeout(() => {
  //       setActive(null, null);
  //     }, 2000);
  //   }
  // });

  const table = useReactTable({
    data: allProduct?.data?.data || [],
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
            onClick={() => navigate("/add-product")}>
            <div className="flex items-center gap-4">
              <Utensils className="w-6 h-6" />
              <p>Add Product</p>
            </div>
          </Button>
        </div>

        {/* List Member */}
        <div className="w-full h-[78%] overflow-scroll no-scrollbar">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter..."
              value={table.getColumn("nameProduct")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("nameProduct")?.setFilterValue(event.target.value)
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

export default ProductList;
