import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import Title from "../components/Title";

const ContactPage: React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <div className="sm:w-4/5 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto">
        <Title
          title="Contact"
          description="For any and all inquiries, send us an email at one of the addresses below."
        />
        <br />
        <p className="text-gray-600" style={{ fontWeight: "bold" }}>
          App Privacy Policy or ToS Inquiries
        </p>
        <a href="mailto:maametaddo@gmail.com" className="text-gray-600">
          maametaddo@gmail.com
        </a>
        <br />
        <br />
        <p className="text-gray-600" style={{ fontWeight: "bold" }}>
          User Account Data
        </p>
        <a href="maametaddo@gmail.com" className="text-gray-600">
          maametaddo@gmail.com
        </a>
        <br />
        <br />
      </div>
      <Footer></Footer>
    </div>
  );
};

export default ContactPage;
