import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";
import { AuthData } from "../../auth/AuthWrapper";

const AccountSettingsPage : React.FC = () => {

  const auth = AuthData();
  const { user } = auth;
  const email = user.email;

  return(
    <div>
      <TopNavbar></TopNavbar>
        <Title title="Account Settings" description={`Settings for account with email: ${email}`}></Title>
      <Footer></Footer>
    </div>
  )
}

export default AccountSettingsPage;