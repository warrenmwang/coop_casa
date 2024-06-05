import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/User";
import { apiGetUserAccountDetails, apiLogoutUser } from "../api/api";

interface AuthContextType {
  user: User;
  authenticated: boolean;
  loggedInInitial: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setLoggedInInitial: React.Dispatch<React.SetStateAction<boolean>>;
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
  loggedInInitial: false,
  login: () => Promise.resolve(), 
  logout: () => Promise.resolve(),
  setUser: () => {},
  setLoggedInInitial: () => {},
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
  const [loggedInInitial, setLoggedInInitial] = useState(false);

  // login the user
  const login = async () => {
    if (!loggedInInitial) {
      const responseData = await apiGetUserAccountDetails()
      if (responseData[0] === 200) {
        // Convert received data to User type
        const userData = responseData[1] as User

        // Set user data in auth context user state
        setUser(userData)

        // Set loggedInInitial to true, to prevent refreshes to conduct redundant logins
        setLoggedInInitial(true)
      }
    }
  }

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
    <AuthContext.Provider value={{user, authenticated, loggedInInitial, login, logout, setUser, setLoggedInInitial, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthWrapper;