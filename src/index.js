import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
// import { LoadingProvider } from "./components/organism/loading";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nextProvider } from "react-i18next";
// import { CookiesProvider } from "react-cookie";
import i18n from "./i18n";
import { SocketProvider } from "@/services/socket";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <CookiesProvider defaultSetOptions={{ path: "/" }}> */}
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <Toaster position="top-center" expand={false} />
        <SocketProvider>
          {/* <LoadingProvider> */}
          <App />
          {/* </LoadingProvider> */}
        </SocketProvider>
      </I18nextProvider>
    </QueryClientProvider>
    {/* </CookiesProvider> */}
  </React.StrictMode>
);
