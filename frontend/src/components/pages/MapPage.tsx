import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

const MapPage: React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title
        title="Map"
        description="Use the interactive map below to locate and keep track of interesting places!"
      ></Title>
      <h2>
        So this needs to be a balance between privacy and being useful. Perhaps
        we will need 2 versions of this map. One is the public one that just
        generally shows which properties are available? Another one is
        personalized for each user, where they can pin certain properties for
        communities that they are interested in. Anyways, I don't think I need
        to think too much about this, because this isn't something that I
        actually want to solve right now.
      </h2>
      <Footer></Footer>
    </div>
  );
};

export default MapPage;
