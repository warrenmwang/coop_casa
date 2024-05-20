import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

const CommunitiesPage : React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Communities" description="Find your group now!"></Title>
      <h2>This will be a dynamic page that will need to query the db for the user created communities that exist.</h2>
      <Footer></Footer>
    </div>
  )
}

export default CommunitiesPage;