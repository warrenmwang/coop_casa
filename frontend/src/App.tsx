// import { Suspense } from "react";
import RouteRenderer from "./components/RouteRenderer";
import { BrowserRouter } from "react-router-dom";
import TextSkeleton from "./skeleton/TextSkeleton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      {/* <Suspense fallback={<TextSkeleton />}> */}
      <RouteRenderer />
      {/* </Suspense> */}
    </BrowserRouter>
  );
}

export default App;
