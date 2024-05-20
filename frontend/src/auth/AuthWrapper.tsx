import { createContext, useContext, useState, ReactNode } from "react";
import { API_HOST, API_PORT } from "../config";

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User;
  authenticated: boolean;
  accountIsSetup: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setAccountIsSetup: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({
  user: {
    userId: '',
    email: ''
  },
  authenticated: false,
  accountIsSetup: false,
  login: () => Promise.resolve(), 
  logout: () => Promise.resolve(),
  setAccountIsSetup: () => {},
})

export const AuthData = () => useContext(AuthContext)

// wrapper to provide the auth state context throughout all components
const AuthWrapper: React.FC<{children: ReactNode}> = ({ children }) => {

  const [ user, setUser ] = useState({userId: '', email: ''})
  const [ authenticated, setAuthenticated ] = useState(false)
  const [ accountIsSetup, setAccountIsSetup ] = useState(false)

  // login the user
  const login = async () => {

    const apiLoginLink = `${API_HOST}:${API_PORT}/api/login`
    
    try {
      // try to login with the token in browser
      const response = await fetch(apiLoginLink, {
        method: 'GET', 
        credentials: 'include', // include the HTTP-only cookie
      });

      if (response.ok) {
        const data = await response.json();

        // set user 
        setUser({
          userId: data.userId,
          email: data.email
        });

        // set authenticated
        setAuthenticated(true);

      } else {
        // current browser jwt invalid 
        // redirect to oauth login to get new jwt, backend will just redirect to dashboard page to keep it simple
        // console.log("going to google oauth")
        // window.location.href = googleAuthLink;
      }
    } catch(error) {
      // TODO: handle the error if something went wrong in this async call
      console.log('Error during login:', error);
      // window.location.href = googleAuthLink;
    }
  }

  // hit the logout api endpoint
  const logout = async () => {
    try {
      const response = await fetch(`${API_HOST}:${API_PORT}/api/logout`, {
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
    <AuthContext.Provider value={{user, authenticated, accountIsSetup, login, logout, setAccountIsSetup}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthWrapper;