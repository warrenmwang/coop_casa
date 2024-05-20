import React from "react";
import Title from "../structure/Title";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

const TermsOfServicePage : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Terms of Service" description=""></Title>
      <p>
        TODO: terms of service of agreement to use this app.
      </p>
      <Footer></Footer>
    </div>
  )
}

export default TermsOfServicePage;