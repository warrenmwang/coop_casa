import { Suspense } from "react";
import AuthWrapper from "./auth/AuthWrapper";
import RouteRenderer from "./components/RouteRenderer";
import { BrowserRouter as Router } from "react-router-dom";
import TextSkeleton from "./skeleton/TextSkeleton";

function App() {
  return (
    <AuthWrapper>
      <Router>
        <Suspense fallback={<TextSkeleton />}>
          <RouteRenderer />
        </Suspense>
      </Router>
    </AuthWrapper>
  );
}

export default App;
