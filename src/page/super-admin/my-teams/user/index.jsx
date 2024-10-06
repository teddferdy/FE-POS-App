import React, { useMemo } from "react";

// import { MapPinPlus } from "lucide-react";
// import { Button } from "../../../components/ui/button";
// import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";
// import { deleteLocation } from "../../../../services/location";
import TemplateContainer from "../../../../components/organism/template-container";
import { useLocation } from "react-router-dom";
// import { useLoading } from "../../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../../components/organism/abort-controller";
import { getUserByLocation, changeRoleUser } from "../../../../services/user";
import DrawerDetailUser from "../../../../components/organism/drawer/drawer-detail-user";
import { useLoading } from "../../../../components/organism/loading";
import { toast } from "sonner";

const UserListByLocation = () => {
  const { state } = useLocation();
  const { setActive } = useLoading();
  console.log("STATE =>", state);

  // QUERY
  const allLocation = useQuery(
    ["get-all-location-table"],
    () => getUserByLocation({ location: state.location }),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const mutateChangeRole = useMutation(changeRoleUser, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Change Role User"
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

  const TABLE_SHOW = useMemo(() => {
    if (allLocation.isLoading && allLocation.isFetching && !allLocation.isError) {
      return <SkeletonTable />;
    }

    if (allLocation.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allLocation.refetch()} />
        </div>
      );
    }

    if (allLocation.data && allLocation.isSuccess && !allLocation.isError) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {allLocation?.data?.data?.map((user) => (
            <DrawerDetailUser
              key={user.id}
              user={user}
              onChangeRole={(val) => {
                const body = {
                  location: user.location,
                  id: user.id,
                  userType: val
                };
                mutateChangeRole.mutate(body);
              }}
            />
          ))}
        </div>
      );
    }
  }, [allLocation]);

  return (
    <TemplateContainer>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">User List</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/overview">Admin Menu</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>User List In {state?.location}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* List Member */}
        {TABLE_SHOW}
      </div>
    </TemplateContainer>
  );
};

export default UserListByLocation;
