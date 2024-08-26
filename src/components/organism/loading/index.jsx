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
        <div className="fixed z-10 overflow-y-auto top-0 w-full left-0">
          <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75" />
              <div className="h-full">
                <div className="justify-center items-center flex flex-col h-screen">
                  <Lottie options={options} height={200} width={200} />
                </div>
              </div>
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
    throw new Error("useCIMBLoading must be used within the LoadingProvider");
  }
  const { active, setActive } = ctx;
  return { active, setActive };
};

LoadingProvider.propTypes = {
  children: PropTypes.element
};

export { LoadingProvider, useLoading };
