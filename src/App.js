import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Routes } from "./routes";
import { useTranslation } from "react-i18next";
import { translationSelect } from "./state/translation";

function App() {
  const { i18n } = useTranslation();
  const { translation } = translationSelect();

  useEffect(() => {
    if (translation) {
      i18n.changeLanguage(translation);
    }
  }, [translation]);

  return <RouterProvider router={Routes} />;
}

export default App;
