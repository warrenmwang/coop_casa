import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";

import "../styles/contentBody.css";
import CommunitiesHomeBanner from "../components/CommunitiesHomeBanner";
import CommunitiesMainBody from "../components/CommunitiesMainBody";

const CommunitiesPage: React.FC = () => {
  return (
    <div className="content-body">
      <CommunitiesHomeBanner />
      <CommunitiesMainBody />
    </div>
  );
};

export default CommunitiesPage;
