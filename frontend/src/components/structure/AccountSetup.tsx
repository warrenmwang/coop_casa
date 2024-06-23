import React from "react";
import { Link } from "react-router-dom";

// If user is missing some couple of "key account details"
// then this component will be displayed in the dashboard.
// This should be like a floating rounded square with drop shadow
// on a white background that the user can click to be routed to the account
// settings page

// Maybe dynamically show what user information the system doesn't have
// on the card.
const AccountSetup: React.FC = () => {
  return (
    <div className="my-4" style={{ textAlign: "center" }}>
      <Link
        to="/account-setup"
        className="mx-auto block bg-white border-2 p-4 shadow-lg rounded-lg w-full sm:w-2/3 lg:w-1/3 sm:p-6 lg:p-8"
      >
        Set up your account!
      </Link>
    </div>
  );
};

export default AccountSetup;
