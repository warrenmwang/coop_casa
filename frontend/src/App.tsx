import React from "react";
import RouteRenderer from "components/RouteRenderer";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import TopNavbar from "components/page_sections/TopNavbar";
import Footer from "components/page_sections/Footer";
import "react-toastify/dist/ReactToastify.css";
import "react-image-gallery/styles/css/image-gallery.css";
import "./styles/container.css";
import "./styles/Modal.css";
import "./styles/font.css";
import "./styles/form.css";
import "./styles/input.css";
import "./styles/font.css";
import "./styles/button.css";
import "./styles/label.css";
import "./styles/contentBody.css";
import "./styles/title.css";
import "./styles/assets.css";
import "./styles/colors.css";
import "./styles/mui.css";

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
