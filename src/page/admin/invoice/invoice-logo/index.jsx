import React, { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

import { useCookies } from "react-cookie";

import {
  getAllInvoiceLogo,
  deleteInvoiceLogo,
  activateOrNotActiveInvoiceLogo
} from "../../../../services/invoice";
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
import TemplateContainer from "../../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../../components/organism/abort-controller";
import TableInvoiceLogoList from "../../../../components/organism/table/table-invoice-logo-list";

const InvoiceLogoList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [cookie] = useCookies(["user"]);

  // QUERY
  const invoiceLogo = useQuery(
    ["get-all-invoice-logo"],
    () => getAllInvoiceLogo({ location: cookie?.user?.store }),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const mutateDeleteInvoiceLogo = useMutation(deleteInvoiceLogo, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Discount"
        });
      }, 1000);
      setTimeout(() => {
        invoiceLogo.refetch();
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

  const mutateChangeIsActiveInvoiceLogo = useMutation(activateOrNotActiveInvoiceLogo, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Change Logo To Invoce"
        });
      }, 1000);
      setTimeout(() => {
        invoiceLogo.refetch();
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
    if (invoiceLogo.isLoading && invoiceLogo.isFetching && !invoiceLogo.isError) {
      return <SkeletonTable />;
    }

    if (invoiceLogo.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => invoiceLogo.refetch()} />
        </div>
      );
    }

    if (invoiceLogo.data && invoiceLogo.isSuccess && !invoiceLogo.isError) {
      return (
        <div className="w-full p-4">
          <TableInvoiceLogoList
            invoiceLogo={invoiceLogo}
            handleActivate={(body) => mutateChangeIsActiveInvoiceLogo.mutate(body)}
            handleDelete={(body) => mutateDeleteInvoiceLogo.mutate(body)}
          />
        </div>
      );
    }
  }, [invoiceLogo, mutateChangeIsActiveInvoiceLogo, mutateDeleteInvoiceLogo]);

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
                <BreadcrumbPage>Invoice Logo List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-invoice-logo")}>
          <div className="flex items-center gap-4">
            <p>Add Logo Invoice</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default InvoiceLogoList;
