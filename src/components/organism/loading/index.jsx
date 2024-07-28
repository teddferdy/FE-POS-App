import React, { createContext, useContext, useMemo, useState } from "react";
import Lottie from "react-lottie";

// Molecule
import Modal from "../../molecule/modal";

// Assets
import LoadingLottie from "../../../assets/lottie/loading.json";
import SuccessLottie from "../../../assets/lottie/success.json";
import FailedLottie from "../../../assets/lottie/failed.json";

const LoadingContext = createContext(null);

const LoadingProvider = ({ children = null }) => {
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
        preserveAspectRatio: "xMidYMid slice",
      },
    };
    if (active !== null) {
      return (
        <Modal>
          <div className="justify-center items-center flex flex-col h-screen">
            <Lottie options={options} height={200} width={200} />
          </div>
        </Modal>
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

export { LoadingProvider, useLoading };
