/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { Card } from "../../ui/card"; // Assuming shadcn's Card component
import { useNavigate } from "react-router-dom";

import SkeletonTable from "../skeleton/skeleton-table";
import AbortController from "../abort-controller";

// StepCard component for each step in the flow
const StepCard = ({ stepNumber, title, description, icon, onClick, disabled }) => {
  return (
    <Card
      className={`p-6 mb-6 text-center shadow-md rounded-lg  w-full ${disabled ? "bg-slate-500" : "bg-white cursor-pointer hover:bg-[#1ACB0A] hover:text-white"}`}
      onClick={onClick}>
      {icon && <div className="mb-4 text-4xl">{icon}</div>} {/* Optional icon */}
      <h2 className="text-2xl font-bold mb-2">{`Step ${stepNumber}: ${title}`}</h2>
      <p>{description}</p>
    </Card>
  );
};

const Arrow = () => {
  return (
    <div className="lg:hidden flex justify-center my-4">
      {/* Arrow pointing down (for vertical layout) */}
      <span className="text-3xl">↓</span>
    </div>
  );
};

const StepFlow = ({ categoryList, subCategoryList, productList }) => {
  const navigate = useNavigate();

  const STEP_CARD_NUMBER_1 = useMemo(() => {
    if (categoryList.isLoading && categoryList.isFetching) {
      return <SkeletonTable />;
    }

    if (categoryList.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => categoryList.refetch()} />
        </div>
      );
    }

    if (categoryList.data && categoryList.isSuccess) {
      return (
        <StepCard
          disabled={false}
          stepNumber={1}
          title="Create Category"
          description="Select a plan that best suits your needs. We offer multiple options for every kind of user."
          icon={<span>📋</span>}
          onClick={() => navigate("/category-list")}
        />
      );
    }
  }, [categoryList]);

  const STEP_CARD_NUMBER_2 = useMemo(() => {
    if (subCategoryList.isLoading || subCategoryList.isFetching) {
      return <SkeletonTable />;
    }

    if (subCategoryList.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => categoryList.refetch()} />
        </div>
      );
    }

    if (subCategoryList.data && subCategoryList.isSuccess) {
      const disabled =
        subCategoryList?.data?.data?.length < 1 && categoryList?.data?.data?.length < 1;

      return (
        <StepCard
          disabled={disabled}
          stepNumber={2}
          title="Create Sub Category (Optional)"
          description="Sign up by providing your details. It only takes a few minutes to get started!"
          icon={<span>🍴</span>}
          onClick={() => {
            if (disabled) {
              return {};
            } else {
              navigate("/sub-category-list");
            }
          }}
        />
      );
    }
  }, [subCategoryList, categoryList]);

  const STEP_CARD_NUMBER_3 = useMemo(() => {
    if (productList.isLoading || productList.isFetching) {
      return <SkeletonTable />;
    }

    if (productList.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => categoryList.refetch()} />
        </div>
      );
    }

    if (productList.data && productList.isSuccess) {
      const disabled = categoryList?.data?.data?.length < 1;

      return (
        <StepCard
          stepNumber={3}
          disabled={disabled}
          title="Create Product"
          description="Now you're all set! Start exploring and using all the features we offer."
          icon={<span>🍽</span>}
          onClick={() => {
            if (disabled) {
              return {};
            } else {
              navigate("/product-list");
            }
          }}
        />
      );
    }
  }, [subCategoryList, categoryList]);

  return (
    <div className="flex flex-col lg:flex-row items-center lg:justify-between mt-10 space-y-6 lg:space-y-0 lg:space-x-6">
      {/* Step 1 */}
      {STEP_CARD_NUMBER_1}
      {/* Arrow for Desktop */}
      <div className="hidden lg:block">
        <span className="text-3xl">→</span> {/* Right arrow for desktop */}
      </div>
      {/* Arrow for Mobile */}
      <Arrow /> {/* Down arrow for mobile */}
      {/* Step 2 */}
      {STEP_CARD_NUMBER_2}
      {/* Arrow for Desktop */}
      <div className="hidden lg:block">
        <span className="text-3xl">→</span> {/* Right arrow for desktop */}
      </div>
      {/* Arrow for Mobile */}
      <Arrow /> {/* Down arrow for mobile */}
      {/* Step 3 */}
      {STEP_CARD_NUMBER_3}
    </div>
  );
};

export default StepFlow;
