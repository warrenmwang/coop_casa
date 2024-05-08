import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

const Contact : React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Contact" description="Please find the contact information of our head of human resources below."></Title>
      <Footer></Footer>
    </div>
  );
}

export default Contact;