// Spinner.js
import React from "react";
import Lottie from "react-lottie";
import LoadingLottie from "../../../assets/lottie/loading.json";

const Spinner = () => {
  const options = {
    loop: true,
    autoplay: true,
    animationData: LoadingLottie,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Lottie options={options} height={100} width={100} />
    </div>
  );
};

export default Spinner;
