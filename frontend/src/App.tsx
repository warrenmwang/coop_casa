import React from "react";
import RouteRenderer from "./components/RouteRenderer";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <RouteRenderer />
    </BrowserRouter>
  );
}

export default App;
