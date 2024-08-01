import { Suspense } from "react";
import RouteRenderer from "./components/RouteRenderer";
import { BrowserRouter as Router } from "react-router-dom";
import TextSkeleton from "./skeleton/TextSkeleton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Suspense fallback={<TextSkeleton />}>
        <RouteRenderer />
      </Suspense>
    </Router>
  );
}

export default App;
