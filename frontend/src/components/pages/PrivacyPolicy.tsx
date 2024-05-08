import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

const PrivacyPolicy : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Privacy Policy" description=""></Title>
      <Footer></Footer>
    </div>
  )
}

export default PrivacyPolicy;