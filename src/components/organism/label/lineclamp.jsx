/* eslint-disable react/prop-types */
import React, { useState } from "react";

const LineClampText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <p className={isExpanded ? "" : "line-clamp-2"}>{text}</p>
      <button onClick={toggleText} className="text-blue-500 hover:underline mt-2">
        {isExpanded ? "See less" : "See more"}
      </button>
    </div>
  );
};

export default LineClampText;
