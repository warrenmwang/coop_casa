import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";
import SearchCommunities from "../structure/SearchCommunities";

import "../../styles/ContentBody.css";

const CommunitiesPage: React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <div className="content-body">
        <Title title="Communities" description="Find your group now!"></Title>
        <h2>
          This will be a dynamic page that will need to query the db for the
          user created communities that exist.
        </h2>
        <SearchCommunities />
      </div>
      <Footer></Footer>
    </div>
  );
};

export default CommunitiesPage;
