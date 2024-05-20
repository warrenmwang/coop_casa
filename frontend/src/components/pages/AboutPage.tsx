import React from "react";
import Footer from "../structure/Footer";
import TopNavbar from "../structure/TopNavbar";
import Title from "../structure/Title";

const AboutPage : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
      <Title title="About Us" description=""></Title>
      <h1>
        We are a small group of students that originally met at Bucknell University and we wanted to do something 
        for other people in a way that doesn't cost them much.
      </h1>
      <Footer></Footer>
    </div>
  )
}

export default AboutPage;