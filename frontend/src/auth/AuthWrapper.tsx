import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/User";
import { getUserAccountDetails, logoutUser } from "../api/api";

interface AuthContextType {
  user: User;
  authenticated: boolean;
  loggedInInitial: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setLoggedInInitial: React.Dispatch<React.SetStateAction<boolean>>;
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
  setLoggedInInitial: () => {}
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
      const responseData = await getUserAccountDetails()
      if (responseData) {
        // Convert received data to User type
        const userData = responseData as User

        // Set user data in auth context user state
        setUser(userData)

        // Set authenticated to true, allow rendering of authenticated endpoints
        setAuthenticated(true)

        // Set loggedInInitial to true, to prevent refreshes to conduct redundant logins
        setLoggedInInitial(true)
      }
    }
  }

  // hit the logout api endpoint
  const logout = async () => {
    // Clear the auth context user data
    setUser(EmptyUser)

    // Log out the user in api and oauth
    const ok = await logoutUser()
    if (!ok) {
      alert("Error during logout. Please try logging out again.")
    }
    
    // Redirect to home page
    window.location.replace("/")
  }

  return(
    <AuthContext.Provider value={{user, authenticated, loggedInInitial, login, logout, setUser, setLoggedInInitial }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthWrapper;