import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/User";
import { apiLogoutUser } from "../api/api";

interface AuthContextType {
  user: User;
  authenticated: boolean;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EmptyUser : User = {
  userId: '',
  email: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  location: '',
  interests: '',
  avatar: ''
}

const AuthContext = createContext<AuthContextType>({
  user: EmptyUser,
  authenticated: false,
  logout: () => Promise.resolve(),
  setUser: () => {},
  setAuthenticated: () => {}
})

export const AuthData = () => useContext(AuthContext)

// wrapper to provide the auth state context throughout all components
const AuthWrapper: React.FC<{children: ReactNode}> = ({ children }) => {

  const [ user, setUser ] = useState({
    userId: '',
    email: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    location: '',
    interests: '',
    avatar: ''
  })
  const [ authenticated, setAuthenticated ] = useState(false)

  // hit the logout api endpoint
  const logout = async () => {
    // console.log("logout")
    // Log out the user in api and oauth
    const ok = await apiLogoutUser()
    if (!ok) {
      alert("Error during logout. Please try logging out again.")
    }

    // Clear the auth context user data
    setUser(EmptyUser)
    // console.log("user set to empty")

    setAuthenticated(false)
    // console.log("authenticated set to false")
    
    // Redirect to home page
    window.location.replace("/")
  }

  return(
    <AuthContext.Provider value={
      {
        user, 
        authenticated, 
        logout,
        setUser,
        setAuthenticated
      }
    }>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthWrapper;