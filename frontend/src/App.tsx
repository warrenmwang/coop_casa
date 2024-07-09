import { Suspense } from "react";
import AuthWrapper from "./auth/AuthWrapper";
import RouteRenderer from "./components/RouteRenderer";
import { BrowserRouter as Router } from "react-router-dom";
import TextSkeleton from "./skeleton/TextSkeleton";
import GlobalStoreWrapper from "./globalStore";

function App() {
  return (
    <AuthWrapper>
      <GlobalStoreWrapper>
        <Router>
          <Suspense fallback={<TextSkeleton />}>
            <RouteRenderer />
          </Suspense>
        </Router>
      </GlobalStoreWrapper>
    </AuthWrapper>
  );
}

export default App;
