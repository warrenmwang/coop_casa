import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TextSkeleton from "../structure/TextSkeleton"
import { apiAuthCheck } from "../../api/api"

interface OAuthCallbackPageArgs {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const OAuthCallbackPage: React.FC<OAuthCallbackPageArgs> = ({ setAuthenticated }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthStatus = async () => {
      const ok = await apiAuthCheck()
      if (ok) {
        setAuthenticated(true) // Set authenticated to true to ensure route renderer updates
        navigate("/dashboard") // Redirect to the dashboard or any other authenticated route
      } else {
        setAuthenticated(false)
        navigate("/") // Redirect to home if not authenticated
      }
    }

    checkAuthStatus()
  }, [navigate, setAuthenticated])

  return <TextSkeleton/>
}

export default OAuthCallbackPage
