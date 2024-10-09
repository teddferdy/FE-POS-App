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
    <div className="justify-center my-4">
      {/* Arrow pointing down (for vertical layout) */}
      <span className="text-3xl">↓</span>
    </div>
  );
};

const StepFlow = ({ allSocialMedia }) => {
  const navigate = useNavigate();

  const STEP_CARD_NUMBER_2 = useMemo(() => {
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
      const disabled = allSocialMedia?.data?.data?.length < 1;
      return (
        <StepCard
          disabled={disabled}
          stepNumber={2}
          title="Create Invoice Social Media"
          description="Sign up by providing your details. It only takes a few minutes to get started!"
          icon={<span>📄</span>}
          onClick={() => {
            if (disabled) {
              return {};
            } else {
              navigate("/social-media-invoice-list");
            }
          }}
        />
      );
    }
  }, [allSocialMedia]);

  return (
    <div className="flex flex-col items-center mt-10 space-y-6">
      {/* Step 1 */}
      <StepCard
        stepNumber={1}
        title="Create Social Media List"
        description="Select a plan that best suits your needs. We offer multiple options for every kind of user."
        icon={<span>🌐</span>}
        onClick={() => navigate("/social-media-list")}
      />
      {/* Arrow for Mobile */}
      <Arrow /> {/* Down arrow for mobile */}
      {/* Step 2 */}
      {STEP_CARD_NUMBER_2}
    </div>
  );
};

export default StepFlow;
