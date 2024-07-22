import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import Title from "../components/Title";

import "../styles/ContentBody.css";
import { Typography } from "@mui/material";

const AttributionsPage: React.FC = () => {
  return (
    <>
      <TopNavbar></TopNavbar>
      <div className="content-body">
        <Title
          title="Attributions"
          description="For usage of third party services or data the require public attribution of their usage on our website, we give them their due credit here."
        ></Title>

        <Typography variant="body1">
          For city and state location data we used the{" "}
          <b>
            <a href="https://simplemaps.com/data/us-cities">
              United States Cities Database
            </a>
          </b>{" "}
          from simplemaps.
        </Typography>
        <Typography variant="body1">
          The fallback house property image is from brgfx taken from Freepik:{" "}
          <a href="https://www.freepik.com/free-vector/sticker-template-with-mini-house-isolated_16508000.htm#query=house%20clipart&position=0&from_view=keyword&track=ais_user&uuid=92db24b8-fc69-40a5-a766-a21911bc32c8">
            link
          </a>{" "}
        </Typography>
      </div>
      <Footer></Footer>
    </>
  );
};

export default AttributionsPage;
