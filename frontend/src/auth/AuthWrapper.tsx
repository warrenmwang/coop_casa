import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User;
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: {
    userId: '',
    email: ''
  },
  authenticated: false,
  login: () => Promise.resolve(), 
  logout: () => Promise.resolve(),
})

// const AuthContext = createContext<AuthContextType>(AuthContext);

export const AuthData = () => useContext(AuthContext)

// wrapper to provide the auth state context throughout all components
const AuthWrapper: React.FC<{children: ReactNode}> = ({ children }) => {

  const [ user, setUser ] = useState({userId: '', email: ''})
  const [ authenticated, setAuthenticated ] = useState(false)

  // login the user
  const login = async () => {

    const apiLoginLink = "http://localhost:8080/api/login"
    
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
      const response = await fetch('http://localhost:8080/api/logout', {
        method: 'GET', 
        credentials: 'include',
      });

      if (!response.ok) {
        // TODO: error popup that tells the user that something went wrong and they need to logout again.
      }
    } catch(error) {
      // TODO: handle error if sonmething went wrong in this async call
      console.log('Error during lout:', error);
    }
  }

  return(
    <AuthContext.Provider value={{user, authenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthWrapper;