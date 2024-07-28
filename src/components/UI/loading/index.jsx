import React, { createContext, useContext, useMemo, useState } from "react";
import Lottie from "react-lottie";

// Molecule
import Modal from "../../molecule/modal";

// Assets
import LoadingLottie from "../../../assets/lottie/success.json";

const LoadingContext = createContext(null);

const LoadingProvider = ({ children = null }) => {
  const [active, setActiveLoading] = useState(false);

  const setActive = (isActive) => {
    setActiveLoading(isActive);
  };

  const LOADING = useMemo(() => {
    const options = {
      loop: true,
      autoplay: true,
      animationData: LoadingLottie,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };
    if (active) {
      return (
        <Modal>
          <div className="justify-center items-center flex flex-col h-screen">
            <Lottie options={options} height={200} width={200} />
          </div>
        </Modal>
      );
    }
  }, [active]);

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
