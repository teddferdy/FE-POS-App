import { useState } from "react";

export function useGlobalStoreFilter(defaultValue = "all") {
  const [storeFilter, setStoreFilter] = useState(
    () => localStorage.getItem("globalStoreFilter") || defaultValue
  );

  const setGlobalStoreFilter = (value) => {
    setStoreFilter(value);
    localStorage.setItem("globalStoreFilter", value);
  };

  return [storeFilter, setGlobalStoreFilter];
}
