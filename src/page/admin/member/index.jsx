import React, { useMemo } from "react";
import { useQuery } from "react-query";
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
import TableMembershipList from "../../../components/organism/table/table-membership-list";

const MemberList = () => {
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
    if (allMember.isLoading && allMember.isFetching && !allMember.isError) {
      return <SkeletonTable />;
    }

    if (allMember.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allMember.refetch()} />
        </div>
      );
    }

    if (allMember.data && allMember.isSuccess && !allMember.isError) {
      return (
        <div className="w-full p-4">
          <TableMembershipList allMember={allMember} />
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
