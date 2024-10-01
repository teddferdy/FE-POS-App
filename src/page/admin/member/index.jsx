import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import moment from "moment";

// Components
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
import { getAllMember } from "../../../services/member";
import TemplateContainer from "../../../components/organism/template-container";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";

const FILTER_BY = [
  {
    value: "nameMember",
    name: "Name Member"
  },
  {
    value: "phoneNumber",
    name: "Phone Number"
  },
  {
    value: "location",
    name: "Location"
  },
  {
    value: "point",
    name: "Point"
  },

  {
    value: "createdBy",
    name: "Created By"
  }
];

const MemberList = () => {
  // const navigate = useNavigate();

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [filterBy, setFilterBy] = useState({
    value: "nameStore",
    name: "Name Store"
  });

  // QUERY
  const allMember = useQuery(
    ["get-all-member"],
    () => getAllMember({ nameMember: "", phoneNumber: "" }),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const TABLE_SHOW = useMemo(() => {
    if (allMember.isLoading && allMember.isFetching) {
      return <SkeletonTable />;
    }

    if (allMember.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allMember.refetch()} />
        </div>
      );
    }

    if (allMember.data && allMember.isSuccess) {
      const columns = [
        {
          accessorKey: "nameMember",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Name Member
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => <div className="text-center">{row.getValue("nameMember")}</div>
        },
        {
          accessorKey: "phoneNumber",
          header: ({ column }) => {
            return (
              <div className="justify-center flex">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Phone Number Member
                  {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
                </Button>
              </div>
            );
          },
          cell: ({ row }) => <div className="text-center">{row.getValue("phoneNumber")}</div>
        },
        {
          accessorKey: "location",
          header: () => <div className="text-center">Location Make Member</div>,
          cell: ({ row }) => {
            return <div className="text-center font-medium">{row.getValue("location")}</div>;
          }
        },
        {
          accessorKey: "phoneNumber",
          header: () => <div className="text-center">Phone Number</div>,
          cell: ({ row }) => {
            return <div className="text-center font-medium">{row.getValue("phoneNumber")}</div>;
          }
        },
        {
          accessorKey: "point",
          header: () => <div className="text-center">Point Member</div>,
          cell: ({ row }) => {
            return <div className="text-center font-medium">{row.getValue("point")}</div>;
          }
        },
        // {
        //   accessorKey: "status",
        //   header: ({ column }) => {
        //     return (
        //       <div className="justify-center flex">
        //         <Button
        //           variant="ghost"
        //           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        //           Status
        //           {/* <CaretSortIcon className="ml-2 h-4 w-4" /> */}
        //         </Button>
        //       </div>
        //     );
        //   },
        //   cell: ({ row }) => {
        //     return <div className="text-center font-medium">{row.getValue("status")}</div>;
        //   }
        // },
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
          cell: () => {
            return (
              <div className="flex flex-col gap-6">
                <Button className="h-8 w-full p-4" onClick={() => {}}>
                  <span>Lihat Detail Member</span>
                  {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
                </Button>
              </div>
            );
          }
        }
      ];

      const table = useReactTable({
        data: allMember?.data?.data || [],
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
  }, [allMember]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">MemberShip</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Member List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default MemberList;
