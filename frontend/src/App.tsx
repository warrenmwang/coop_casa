import React from "react";
import "react-toastify/dist/ReactToastify.css";
import "react-image-gallery/styles/css/image-gallery.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import RouteRenderer from "@app/components/RouteRenderer";
import TopNavbar from "@app/components/page_sections/TopNavbar";
import Footer from "@app/components/page_sections/Footer";
import "@app/index.css";
import "@app/styles/container.css";
import "@app/styles/Modal.css";
import "@app/styles/font.css";
import "@app/styles/form.css";
import "@app/styles/input.css";
import "@app/styles/font.css";
import "@app/styles/button.css";
import "@app/styles/label.css";
import "@app/styles/contentBody.css";
import "@app/styles/title.css";
import "@app/styles/assets.css";
import "@app/styles/colors.css";
import "@app/styles/mui.css";
import "@app/styles/table.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <TopNavbar />
      <main>
        <RouteRenderer />
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
