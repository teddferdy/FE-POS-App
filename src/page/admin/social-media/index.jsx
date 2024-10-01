/* eslint-disable no-undef */
import React, { useState, useMemo } from "react";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { getAllSocialMedia, deleteSocialMedia } from "../../../services/social-media";
import DialogDeleteItem from "../../../components/organism/dialog/dialogDeleteItem";

import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";

const SocialMediaList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // QUERY
  const allSocialMedia = useQuery(["get-all-social-media"], () => getAllSocialMedia(), {
    retry: 0,
    keepPreviousData: true
  });

  const mutateDeleteSocialMedia = useMutation(deleteSocialMedia, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Social Media"
        });
      }, 1000);
      setTimeout(() => {
        allSocialMedia.refetch();
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

  const TABLE_SHOW = useMemo(() => {
    if (allSocialMedia.isLoading && allSocialMedia.isFetching) {
      return <SkeletonTable />;
    }

    if (allSocialMedia.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allSocialMedia.refetch()} />
        </div>
      );
    }

    if (allSocialMedia.data && allSocialMedia.isSuccess) {
      const columns = [
        {
          accessorKey: "name",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Name Social Media
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => <div className="text-center">{row.getValue("name")}</div>
        },
        {
          accessorKey: "createdBy",
          header: () => <div className="text-center">createdBy</div>,
          cell: ({ row }) => {
            return <div className="text-center font-medium">{row.getValue("createdBy")}</div>;
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
              <div className="text-center font-medium">
                {moment(row.getValue("createdAt")).format("DD/MM/YYYY hh:mm:ss") || "-"}
              </div>
            );
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
                    navigate(`/edit-social-media/${row?.original?.id}`, {
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
                      id: row?.original?.id,
                      name: row.original.name
                    };
                    mutateDeleteSocialMedia.mutate(body);
                  }}
                />
              </div>
            );
          }
        }
      ];

      const table = useReactTable({
        data: allSocialMedia?.data?.data || [],
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
        <div className="w-full p-4">
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
      );
    }
  }, [allSocialMedia]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Social Media</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Social Media List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-social-media")}>
          <div className="flex items-center gap-4">
            <ClipboardType className="w-6 h-6" />
            <p>Add Social Media</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default SocialMediaList;
