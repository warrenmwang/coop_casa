import React, { useEffect } from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchProperties from "../structure/SearchProperties";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from '../../auth/AuthWrapper'
import AccountSetup from "../structure/AccountSetup";
import { getIsAccountSetup } from "../../api/api";

// Dashboard is only showed when user is authed.
const DashboardPage: React.FC = () => {

  const auth = AuthData();
  const { user, accountIsSetup, setAccountIsSetup } = auth;
  const email = user.email;
  const userId = user.userId;

  // Check if user account is setup, if not display section to remind user to set up their account
  useEffect(() => {
    const foo = async () => {
      const tmp = await getIsAccountSetup(userId);
      setAccountIsSetup(tmp);
    }
    foo();
  }, []) // Run once at render
 
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