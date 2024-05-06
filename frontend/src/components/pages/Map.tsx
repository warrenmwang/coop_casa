import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

const Map : React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <h1>Map placeholder.</h1>
      <h2>
        So this needs to be a balance between privacy and being useful.
        Perhaps we will need 2 versions of this map.
        One is the public one that just generally shows which properties are available? 
        Another one is personalized for each user, where they can pin certain properties for communities that they
        are interested in.

        Anyways, I don't think I need to think too much about this, because this isn't something that I actually want to solve right now.
      </h2>
      <Footer></Footer>
    </div>
  )
}

export default Map;