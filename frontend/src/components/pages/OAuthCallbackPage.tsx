import React from "react"
import { useNavigate } from "react-router-dom"
import TextSkeleton from "../structure/TextSkeleton"
import { useAPIAuthCheck } from "../../api/api"
import { dashboardPageLink, homePageLink } from "../../urls";

interface OAuthCallbackPageArgs {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const OAuthCallbackPage: React.FC<OAuthCallbackPageArgs> = ({ setAuthenticated }) => {
  const navigate = useNavigate();

  const apiAuthCheckResult = useAPIAuthCheck();
  if (!apiAuthCheckResult.loading){
    if (apiAuthCheckResult.accountIsAuthed) {
      // authed
      setAuthenticated(true);
      navigate(dashboardPageLink);
    } else {
      // not authed
      setAuthenticated(false);
      navigate(homePageLink);
    }
  }
  
  return <TextSkeleton/>;
}

export default OAuthCallbackPage;
