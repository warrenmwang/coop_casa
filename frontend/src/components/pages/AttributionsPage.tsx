import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

const AttributionsPage : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Attributions" description="For usage of third party services or data the require public attribution of their usage on our website, we give them their due credit here."></Title>
        For city and state location data we used the <b><a href="https://simplemaps.com/data/us-cities">United States Cities Database</a></b> from simplemaps.
      <Footer></Footer>
    </div>
  )
}

export default AttributionsPage;