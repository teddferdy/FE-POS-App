import React, { createContext, useContext, useMemo, useState } from "react";
import Lottie from "react-lottie";
import PropTypes from "prop-types";

// Assets
import LoadingLottie from "../../../assets/lottie/loading.json";
import SuccessLottie from "../../../assets/lottie/success.json";
import FailedLottie from "../../../assets/lottie/failed.json";

const LoadingContext = createContext(null);

const LoadingProvider = ({ children }) => {
  const [active, setActiveLoading] = useState(null);
  const [status, setStatus] = useState(null);

  const setActive = (isActive, status) => {
    setActiveLoading(isActive);
    setStatus(status);
  };

  const LOADING = useMemo(() => {
    let lottie = null;
    if (!active && status === "success") {
      lottie = SuccessLottie;
    } else if (!active && status === "error") {
      lottie = FailedLottie;
    } else {
      lottie = LoadingLottie;
    }

    const options = {
      loop: true,
      autoplay: true,
      animationData: lottie,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };

    if (active !== null) {
      return (
        <div className="fixed z-50 top-0 left-0 w-full h-full overflow-y-auto bg-gray-900 bg-opacity-75">
          <div className="flex justify-center items-center h-full">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              <Lottie options={options} height={200} width={200} />
            </div>
          </div>
        </div>
      );
    }
  }, [active, status]);

  return (
    <LoadingContext.Provider value={{ active, setActive }}>
      {LOADING}
      {children}
    </LoadingContext.Provider>
  );
};

const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within the LoadingProvider");
  }
  const { active, setActive } = ctx;
  return { active, setActive };
};

LoadingProvider.propTypes = {
  children: PropTypes.element.isRequired
};

export { LoadingProvider, useLoading };
