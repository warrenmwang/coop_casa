import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Title from "../structure/Title";
import Footer from "../structure/Footer";
import SearchProperties from "../structure/SearchProperties";

const PropertiesPage : React.FC = () => {
  return(
    <div>
      <TopNavbar/>
      <Title title="Properties on Coop" description="Browse to find your desired property to co-own with your buddies."/>
      <p className="mx-auto block" style={{textAlign: "center"}}>
        TODO: dynamically create lists of some top properties or some random properties
      </p>

      <SearchProperties/>
      <Footer/>
    </div>
  );
}

export default PropertiesPage;