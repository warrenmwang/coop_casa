import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

const Communities : React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <h1>Communities page placeholder.</h1>
      <h2>This will be a dynamic page that will need to query the db for the user created communities that exist.</h2>
      <Footer></Footer>
    </div>
  )
}

export default Communities;