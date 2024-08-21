import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import { LoadingProvider } from "./components/organism/loading";
import "./index.css";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" expand={false} />
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
