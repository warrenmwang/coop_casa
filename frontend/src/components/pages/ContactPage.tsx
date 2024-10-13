import React from "react";
import Title from "components/Title";
const ContactPage: React.FC = () => {
  return (
    <div className="content-body">
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
  );
};

export default ContactPage;
