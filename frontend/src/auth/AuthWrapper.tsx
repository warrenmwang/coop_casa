import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/User";
import { api_account_Link, api_logout_Link } from "../urls";

interface AuthContextType {
  user: User;
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
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
  login: () => Promise.resolve(), 
  logout: () => Promise.resolve(),
  setUser: () => {}
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

  // login the user
  const login = async () => {

    try {
      // try to login with the token in browser
      const response = await fetch(api_account_Link, {
        method: 'GET', 
        credentials: 'include', // include the HTTP-only cookie
      });

      if (response.ok) {
        const data = (await response.json()) as User;

        // Set user 
        setUser(data)

        // set authenticated
        setAuthenticated(true);

      } else {
        // current browser jwt invalid 
        // redirect to oauth login to get new jwt, backend will just redirect to dashboard page to keep it simple
        // console.log("going to google oauth")
        // window.location.href = googleAuthLink;
        console.log(`Got not ok response from login: ${response}`)
      }
    } catch(error) {
      // TODO: handle the error if something went wrong in this async call
      console.log('Error during login:', error);
      // window.location.href = googleAuthLink;
    }
  }

  // hit the logout api endpoint
  const logout = async () => {
    // Clear the auth context user data
    setUser(EmptyUser)

    // Logout the user in the api backend as well
    try {
      const response = await fetch(api_logout_Link, {
        method: 'GET', 
        credentials: 'include',
      });

      if (!response.ok) {
        // TODO: error popup that tells the user that something went wrong and they need to logout again.
      } else {
        window.location.href = '/'
      }

    } catch(error) {
      // TODO: handle error if sonmething went wrong in this async call
      console.log('Error during logout:', error);
    }
  }

  return(
    <AuthContext.Provider value={{user, authenticated,login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthWrapper;