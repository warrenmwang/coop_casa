import React from "react";
import { Link } from "react-router-dom";

// If user is missing some couple of "key account details"
// then this component will be displayed in the dashboard.
// This should be like a floating rounded square with drop shadow
// on a white background that the user can click to be routed to the account
// settings page

// Maybe dynamically show what user information the system doesn't have
// on the card.
const AccountSetup : React.FC = () => {
  return(
    <div>
      <Link
        to="/account-setup"
        className="mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white"
      />
      Set up your account!
    </div>
  );
}

export default AccountSetup;