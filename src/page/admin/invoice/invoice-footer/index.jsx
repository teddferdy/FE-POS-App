import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../../../components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";
import {
  getAllInvoiceFooter,
  deleteInvoiceFooter,
  activateOrNotActiveInvoiceFooter
} from "../../../../services/invoice";
import TemplateContainer from "../../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../../components/organism/abort-controller";
import TableInvoiceFooterList from "../../../../components/organism/table/table-invoice-footer";

const InvoiceFooterList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [cookie] = useCookies(["user"]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    status: "all",
    isActive: "all"
  });

  // QUERY
  const invoiceFooter = useQuery(
    ["get-all-invoice-footer", pagination],
    () =>
      getAllInvoiceFooter({
        location: cookie?.user?.store,
        page: pagination.page,
        limit: pagination.limit,
        status: pagination.status,
        isActive: pagination.isActive
      }),
    {
      keepPreviousData: false,
      cacheTime: 0
    }
  );

  const mutateDeleteInvoiceFooter = useMutation(deleteInvoiceFooter, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Invoice Footer"
        });
      }, 1000);
      setTimeout(() => {
        invoiceFooter.refetch();
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

  const mutateChangeIsActiveInvoiceFooter = useMutation(activateOrNotActiveInvoiceFooter, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Change Footer Invoce"
        });
      }, 1000);
      setTimeout(() => {
        invoiceFooter.refetch();
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
    if (invoiceFooter.isLoading && invoiceFooter.isFetching && !invoiceFooter.isError) {
      return <SkeletonTable />;
    }

    if (invoiceFooter.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => invoiceFooter.refetch()} />
        </div>
      );
    }

    if (invoiceFooter.data && invoiceFooter.isSuccess && !invoiceFooter.isError) {
      return (
        <div className="w-full p-4">
          <TableInvoiceFooterList
            invoiceFooter={invoiceFooter}
            handleActivate={(body) => mutateChangeIsActiveInvoiceFooter.mutate(body)}
            handleDelete={(body) => mutateDeleteInvoiceFooter.mutate(body)}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      );
    }
  }, [
    invoiceFooter,
    mutateChangeIsActiveInvoiceFooter,
    mutateDeleteInvoiceFooter,
    pagination,
    setPagination
  ]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Footer</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/dashboard-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      Invoice Menu
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/invoice-page">Invoice Page</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/logo-invoice-list">Logo</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/social-media-invoice-list">
                          Social Media
                        </BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/footer-invoice-list">Footer</BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Footer List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-invoice-footer")}>
          <div className="flex items-center gap-4">
            <p>Add Footer Invoice</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default InvoiceFooterList;
