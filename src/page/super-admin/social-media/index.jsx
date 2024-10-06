import React, { useMemo } from "react";
import { ClipboardType } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { getAllSocialMedia, deleteSocialMedia } from "../../../services/social-media";
import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import TableSocialMediaList from "../../../components/organism/table/table-social-media-list";
const SocialMediaList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();

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
    if (allSocialMedia.isLoading && allSocialMedia.isFetching && !allSocialMedia.isError) {
      return <SkeletonTable />;
    }

    if (allSocialMedia.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allSocialMedia.refetch()} />
        </div>
      );
    }

    if (allSocialMedia.data && allSocialMedia.isSuccess && !allSocialMedia.isError) {
      return (
        <div className="w-full p-4">
          <TableSocialMediaList
            allSocialMedia={allSocialMedia}
            handleDelete={(body) => mutateDeleteSocialMedia.mutate(body)}
          />
        </div>
      );
    }
  }, [allSocialMedia, mutateDeleteSocialMedia]);

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
