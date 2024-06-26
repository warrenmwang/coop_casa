import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import "../../styles/ContentBody.css"
import { Typography } from "@mui/material";

const AttributionsPage : React.FC = () => {
  return(
    <>
      <TopNavbar></TopNavbar>
      <div className="content-body">
        <Title title="Attributions" description="For usage of third party services or data the require public attribution of their usage on our website, we give them their due credit here."></Title>
        <Typography variant="body1">
          For city and state location data we used the <b><a href="https://simplemaps.com/data/us-cities">United States Cities Database</a></b> from simplemaps.
        </Typography>
      </div>
      <Footer></Footer>
    </>
  )
}

export default AttributionsPage;