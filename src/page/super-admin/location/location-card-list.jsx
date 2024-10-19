import React, { useMemo } from "react";
import { MapPinPlus, ChevronDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../../components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { getAllLocation } from "../../../services/location";
import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import LocationCard from "../../../components/organism/card/location-card";

const LocationCardList = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // QUERY
  const { isLoading, isFetching, isError, data, refetch, isSuccess } = useQuery(
    ["get-all-location-card"],
    () => getAllLocation(),
    {
      retry: 0,
      keepPreviousData: false
    }
  );

  const BREADCRUMB = useMemo(() => {
    switch (pathname) {
      case "/invoice-by-outlet":
        return (
          <div className="flex flex-col gap-4 p-4">
            <h1 className="text-[#6853F0] text-lg font-bold">Invoice By Outlet</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard-super-admin">Transaction</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Invoice By Outlet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        );
      case "/product-by-outlet":
        return (
          <div className="flex flex-col gap-4 p-4">
            <h1 className="text-[#6853F0] text-lg font-bold">Product By Outlet</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard-super-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      Transaction <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/invoice-by-outlet">Invoice By Outlet</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/discount-by-outlet">
                          Discount By Outlet
                        </BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/type-payment-by-outlet">
                          Type Payment By Outlet
                        </BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Invoice By Outlet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        );
      case "/my-teams-location-available":
        return (
          <div className="flex flex-col gap-4 p-4">
            <h1 className="text-[#6853F0] text-lg font-bold">User</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard-super-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      My Teams <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/my-teams-location-available">User</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/position-list">Position</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/role-list">Role</BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>User</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        );
      case "/discount-by-outlet":
        return (
          <div className="flex flex-col gap-4 p-4">
            <h1 className="text-[#6853F0] text-lg font-bold">Discount By Outlet</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard-super-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      Transaction <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/invoice-by-outlet">Invoice By Outlet</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/discount-by-outlet">
                          Discount By Outlet
                        </BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/type-payment-by-outlet">
                          Type Payment By Outlet
                        </BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Discount By Outlet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        );
      case "/type-payment-by-outlet":
        return (
          <div className="flex flex-col gap-4 p-4">
            <h1 className="text-[#6853F0] text-lg font-bold">Type Payment By Outlet</h1>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  Transaction <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <BreadcrumbLink href="/invoice-by-outlet">Invoice By Outlet</BreadcrumbLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BreadcrumbLink href="/discount-by-outlet">Discount By Outlet</BreadcrumbLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BreadcrumbLink href="/type-payment-by-outlet">
                      Type Payment By Outlet
                    </BreadcrumbLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </div>
        );
      default:
        return null;
    }
  }, [pathname]);

  const handleLocationClick = (locationId) => {
    switch (pathname) {
      case "/my-teams-location-available":
        navigate("/my-teams-user", { state: { location: locationId } });
        break;
      case "/product-by-outlet":
        navigate("/product-list-by-outlet", { state: { location: locationId } });
        break;
      case "/discount-by-outlet":
        navigate("/discount-list-by-outlet", { state: { location: locationId } });
        break;
      case "/type-payment-by-outlet":
        navigate("/type-payment-list-by-outlet", { state: { location: locationId } });
        break;
      default:
        break;
    }
  };

  const SHOW_LIST = useMemo(() => {
    if (isLoading || isFetching) {
      return <SkeletonTable />;
    }

    if (isError) {
      return (
        <div className="p-4">
          <AbortController refetch={refetch} />
        </div>
      );
    }

    if (isSuccess && data?.data?.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data?.data?.map((location) => (
            <LocationCard
              key={location.id}
              idLocation={location.id}
              image={location.image}
              nameStore={location.nameStore}
              address={location.address}
              phoneNumber={location.phoneNumber}
              handleLocation={() => handleLocationClick(location.id)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="h-[65vh] flex justify-center flex-col items-center bg-gray-500 w-full rounded-lg gap-6">
        <h1>Location Still Empty</h1>
        <p>Please Add New Location</p>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-location")}>
          <div className="flex items-center gap-4">
            <MapPinPlus className="w-6 h-6" />
            <p>Add Location</p>
          </div>
        </Button>
      </div>
    );
  }, [isLoading, isFetching, isError, isSuccess, data, refetch, navigate, pathname]);

  return (
    <TemplateContainer>
      {BREADCRUMB}
      <div className="p-4">{SHOW_LIST}</div>
    </TemplateContainer>
  );
};

export default LocationCardList;
