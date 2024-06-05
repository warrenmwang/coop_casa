import React, { useEffect } from "react"
import { AuthData } from "../../auth/AuthWrapper"

// The only purpose of this component is to separately query for the
// user details at initial load time. This component is invisible.
const LoginUserComp : React.FC = () => {

  const auth = AuthData()
  const {login} = auth

  useEffect(() => {
    const handleLoginUser = async () => {
      try {
        // console.log("loginusercomp")
        await login()
      } catch(error) {
        // console.log(`Couldn't get user data at initial login.`)
      }
    }
    handleLoginUser()
  }, [login]) // only run once at comp render

  return(
    <div></div>
  )
}

export default LoginUserComp