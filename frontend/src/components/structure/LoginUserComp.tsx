import React from "react";
import { useAPIGetUserAccount } from "../../api/api";

// The only purpose of this component is to separately query for the
// user details at initial load time. This component is invisible.
const LoginUserComp: React.FC = () => {
  const _ = useAPIGetUserAccount();

  return <></>;
};

export default LoginUserComp;
