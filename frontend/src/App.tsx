import { Suspense } from "react";
import AuthWrapper from "./auth/AuthWrapper";
import RouteRenderer from "./components/structure/RouteRenderer";
import { BrowserRouter as Router } from "react-router-dom";
import TextSkeleton from "./components/structure/TextSkeleton";
import GlobalStoreWrapper from "./globalStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();
  return (
    <AuthWrapper>
      <QueryClientProvider client={queryClient}>
        <GlobalStoreWrapper>
          <Router>
            <Suspense fallback={<TextSkeleton />}>
              <RouteRenderer />
            </Suspense>
          </Router>
        </GlobalStoreWrapper>
      </QueryClientProvider>
    </AuthWrapper>
  );
}

export default App;
