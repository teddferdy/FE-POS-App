import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { AlarmClockPlus } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../../../components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { getAllShift, deleteShift } from "../../../services/shift";
import DialogDeleteItem from "../../../components/organism/dialog/dialogDeleteItem";

import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";

const FILTER_BY = [
  {
    value: "nameShift",
    name: "Name Shift"
  },

  {
    value: "description",
    name: "Description"
  },

  {
    value: "createdBy",
    name: "Created By"
  }
];

const ShiftList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const [filterBy, setFilterBy] = useState({
    value: "nameShift",
    name: "Name Shift"
  });

  // QUERY
  const allShift = useQuery(["get-all-shift"], () => getAllShift(), {
    retry: 0,
    keepPreviousData: true
  });

  const mutateDeleteShift = useMutation(deleteShift, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Shift"
        });
      }, 1000);
      setTimeout(() => {
        allShift.refetch();
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
    if (allShift.isLoading && allShift.isFetching) {
      return <SkeletonTable />;
    }

    if (allShift.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allShift.refetch()} />
        </div>
      );
    }

    if (allShift.data && allShift.isSuccess) {
      const columns = [
        {
          accessorKey: "nameShift",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Name Shift
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => <div className="text-center">{row.getValue("nameShift")}</div>
        },
        {
          accessorKey: "description",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  description
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => <div className="text-center">{row.getValue("description")}</div>
        },
        {
          accessorKey: "startHour",
          header: () => <div className="text-center">Start Hour</div>,
          cell: ({ row }) => {
            return <div className="text-center">{row.getValue("startHour")}</div>;
          }
        },
        {
          accessorKey: "endHour",
          header: () => <div className="text-center">End Hour</div>,
          cell: ({ row }) => {
            return <div className="text-center">{row.getValue("endHour")}</div>;
          }
        },
        {
          accessorKey: "status",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Status
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => {
            return <div className="text-center">{row.getValue("status")}</div>;
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
          accessorKey: "modifiedBy",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Modified By
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => {
            return <div className="text-center">{row.getValue("modifiedBy")}</div>;
          }
        },
        {
          accessorKey: "updatedAt",
          header: () => <div className="text-center">Updated At</div>,
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
          header: () => <div className="text-center">Action</div>,
          cell: ({ row }) => {
            return (
              <div className="flex flex-col gap-6">
                <Button
                  className="h-8 w-full p-4"
                  onClick={() =>
                    navigate(`/edit-shift/${row?.original?.id}`, {
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
                      nameShift: row.getValue("nameShift")
                    };
                    mutateDeleteShift.mutate(body);
                  }}
                />
              </div>
            );
          }
        }
      ];

      const table = useReactTable({
        data: allShift?.data?.data || [],
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
      );
    }
  }, [allShift]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Shift</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shift List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-shift")}>
          <div className="flex items-center gap-4">
            <AlarmClockPlus className="w-6 h-6" />
            <p>Add Shift</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default ShiftList;
