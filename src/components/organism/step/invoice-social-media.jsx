/* eslint-disable react/prop-types */
import React from "react";
import { Card } from "../../ui/card"; // Assuming shadcn's Card component
import { useNavigate } from "react-router-dom";

// StepCard component for each step in the flow
const StepCard = ({ stepNumber, title, description, icon, onClick }) => {
  return (
    <Card
      className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
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

const StepFlow = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col lg:flex-row items-center lg:justify-between mt-10 space-y-6 lg:space-y-0 lg:space-x-6">
      {/* Step 1 */}
      <StepCard
        stepNumber={1}
        title="Create Social Media List"
        description="Select a plan that best suits your needs. We offer multiple options for every kind of user."
        icon={<span>🌐</span>}
        onClick={() => navigate("/social-media-list")}
      />
      {/* Arrow for Desktop */}
      <div className="hidden lg:block">
        <span className="text-3xl">→</span> {/* Right arrow for desktop */}
      </div>
      {/* Arrow for Mobile */}
      <Arrow /> {/* Down arrow for mobile */}
      {/* Step 2 */}
      <StepCard
        stepNumber={2}
        title="Create Invoice Social Media"
        description="Sign up by providing your details. It only takes a few minutes to get started!"
        icon={<span>📄</span>}
        onClick={() => navigate("/social-media-invoice-list")}
      />
    </div>
  );
};

export default StepFlow;
