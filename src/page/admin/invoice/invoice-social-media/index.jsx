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
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Switch } from "../../../../components/ui/switch";
import {
  getAllInvoiceSocialMedia,
  deleteInvoiceSocialMedia,
  activateOrNotActiveInvoiceSocialMedia
} from "../../../../services/invoice";
import DialogSocialMediaInvoice from "../../../../components/organism/dialog/dialog-social-media-invoice";
import DialogDeleteItem from "../../../../components/organism/dialog/dialogDeleteItem";
import DialogBySwitch from "../../../../components/organism/dialog/dialog-switch";
import TemplateContainer from "../../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";

const InvoiceSocialMediaList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("name")}</div>;
      }
    },
    {
      accessorKey: "socialMediaList",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Social Media List
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => {
        const data = row.original.socialMediaList;
        return <DialogSocialMediaInvoice data={data} />;
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
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("status") ? (
            <Badge variant="secondary">Active</Badge>
          ) : (
            <Badge variant="destructive">Not Active</Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            isActive
            {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
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
            {/* If Status Active Can Change Logo */}
            {row.original.status ? (
              <DialogBySwitch
                checked={row.original.isActive}
                onChange={() =>
                  mutateChangeIsActiveInvoiceSocialMedia.mutate({
                    id: row.original.id,
                    name: row.original.name,
                    isActive: true
                  })
                }
              />
            ) : (
              <div className="flex justify-between items-center gap-6">
                <p>Not Active</p>
                <Switch disabled checked={row.original.isActive} />
                <p>Active</p>
              </div>
            )}

            <Button
              className="h-8 w-full p-4"
              onClick={() =>
                navigate(`/edit-invoice-social-media/${row?.original?.id}`, {
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
                  name: row?.original?.name
                };
                mutateDeleteInvoiceSocialMedia.mutate(body);
              }}
            />
          </div>
        );
      }
    }
  ];

  // QUERY
  const invoiceSocialMedia = useQuery(
    ["get-all-invoice-social-media"],
    () => getAllInvoiceSocialMedia(),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const mutateDeleteInvoiceSocialMedia = useMutation(deleteInvoiceSocialMedia, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Discount"
        });
      }, 1000);
      setTimeout(() => {
        invoiceSocialMedia.refetch();
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

  const mutateChangeIsActiveInvoiceSocialMedia = useMutation(
    activateOrNotActiveInvoiceSocialMedia,
    {
      onMutate: () => setActive(true, null),
      onSuccess: () => {
        setActive(false, "success");
        setTimeout(() => {
          toast.success("Success", {
            description: "Successfull, Change Logo To Invoce"
          });
        }, 1000);
        setTimeout(() => {
          invoiceSocialMedia.refetch();
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
    }
  );

  const table = useReactTable({
    data: invoiceSocialMedia?.data?.data || [],
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
            onClick={() => navigate("/add-invoice-social-media")}>
            <div className="flex items-center gap-4">
              <Percent className="w-6 h-6" />
              <p>Add Social Media Invoice</p>
            </div>
          </Button>
        </div>

        {/* List Member */}
        <div className="w-full h-[78%] overflow-scroll no-scrollbar">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter..."
              value={table.getColumn("description")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("description")?.setFilterValue(event.target.value)
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

export default InvoiceSocialMediaList;
