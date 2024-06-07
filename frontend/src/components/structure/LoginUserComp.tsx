import React from "react"
import { AuthData } from "../../auth/AuthWrapper"
import { User } from "../../types/User"
import { useAPIGetUserAccount } from "../../api/api"

// The only purpose of this component is to separately query for the
// user details at initial load time. This component is invisible.
const LoginUserComp : React.FC = () => {

  const auth = AuthData()
  const { setUser} = auth

  const getUserAccount = useAPIGetUserAccount();
    if (!getUserAccount.loading) {
      if (getUserAccount.user !== null) {
        setUser((getUserAccount.user as User))
      }
    }

  return(
    <></>
  )
}

export default LoginUserComp