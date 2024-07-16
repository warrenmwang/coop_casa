import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/Types";
import { apiLogoutUser } from "../api/api";

interface AuthContextType {
  user: User;
  authenticated: boolean;
  userRole: string;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserRole: React.Dispatch<React.SetStateAction<string>>;
}

export const EmptyUser: User = {
  userId: "",
  email: "",
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  location: "",
  interests: "",
  avatar: null,
};

const AuthContext = createContext<AuthContextType>({
  user: EmptyUser,
  authenticated: false,
  userRole: "",
  logout: () => Promise.resolve(),
  setUser: () => {},
  setAuthenticated: () => {},
  setUserRole: () => {},
});

export const AuthData = () => useContext(AuthContext);

// wrapper to provide the auth state context throughout all components
const AuthWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    userId: "",
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    location: "",
    interests: "",
    avatar: null,
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  const logout = async () => {
    // Log out the user in api and oauth
    const ok = await apiLogoutUser();
    if (!ok) {
      alert("Error during logout. Please try logging out again.");
    }

    // Clear the auth context user data
    setUser(EmptyUser);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        userRole,
        logout,
        setUser,
        setAuthenticated,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthWrapper;
