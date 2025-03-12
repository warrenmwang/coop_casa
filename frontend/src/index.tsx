import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { IS_PROD } from "./config";
import "./index.css";

const queryClient = new QueryClient();

const DevTools = React.lazy(() =>
  import("@tanstack/react-query-devtools").then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    {!IS_PROD && (
      <React.Suspense fallback={null}>
        <DevTools />
      </React.Suspense>
    )}
  </QueryClientProvider>,
);
