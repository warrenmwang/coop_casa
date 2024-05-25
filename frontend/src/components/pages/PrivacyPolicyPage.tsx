import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";

const PrivacyPolicyPage : React.FC = () => {
  return(
    <div>
      <TopNavbar></TopNavbar>
        <iframe 
          className="w-full min-h-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto"
          src="https://docs.google.com/document/d/e/2PACX-1vQceYWJ0PfQdWaIisiPBeeBRwVmFCqWg2xZMBnprDUEadQIRpPZ9cuiBvfWx7rnspnqakGQjLkyBYm5/pub?embedded=true"
        ></iframe>

      <Footer></Footer>
    </div>
  )
}

export default PrivacyPolicyPage;