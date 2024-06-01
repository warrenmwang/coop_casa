import React, { useEffect, useState } from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchProperties from "../structure/SearchProperties";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from '../../auth/AuthWrapper'
import AccountSetup from "../structure/AccountSetup";

// Dashboard is only showed when user is authed.
const DashboardPage: React.FC = () => {

  const auth = AuthData();

  const [email, setEmail] = useState('placeholder');
  const [accountIsSetup, setAccountIsSetup] = useState(false);

  useEffect(() => {
    const { user } = auth;
    setEmail(user.email)
    setAccountIsSetup(user.firstName !== "")
  }, [])
 
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Dashboard" description={`Welcome ${email}`}></Title>
      {!accountIsSetup && <AccountSetup />}
      { accountIsSetup && <SearchCommunities/> && <SearchProperties/> }
      <Footer></Footer>
    </div>
  )
}

export default DashboardPage;