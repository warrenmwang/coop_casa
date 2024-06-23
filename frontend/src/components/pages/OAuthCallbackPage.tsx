import React from "react";
import { useNavigate } from "react-router-dom";
import TextSkeleton from "../structure/TextSkeleton";
import { useAPIAuthCheck } from "../../api/api";
import { dashboardPageLink, homePageLink } from "../../urls";
import { AuthData } from "../../auth/AuthWrapper";

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const _ = useAPIAuthCheck();

  // Auth check fetch has completed
  const auth = AuthData();
  const { authenticated } = auth;
  if (authenticated) {
    navigate(dashboardPageLink);
  } else {
    navigate(homePageLink);
  }

  return <TextSkeleton />;
};

export default OAuthCallbackPage;
