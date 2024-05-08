import React, { useEffect } from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchLocations from "../structure/SearchLocations";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from '../../auth/AuthWrapper'

// TODO: this should pretty much replace everything in the main section of the page
// once the user logs in / creates an account.
const Dashboard: React.FC = () => {

  const auth = AuthData();
  const { user, login } = auth;

  useEffect(() => {
    const handleLogin = async () => {
      await login();
    }
    handleLogin()
  }, []) // empty array dependency to tell useEffect hook to call login only at first render.

  const email = user.email
  
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Dashboard" description={`Welcome ${email}`}></Title>
      <SearchCommunities></SearchCommunities>
      <SearchLocations></SearchLocations>
      <Footer></Footer>
    </div>
  )
}

export default Dashboard;