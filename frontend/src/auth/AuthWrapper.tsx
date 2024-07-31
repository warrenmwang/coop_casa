import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User, APIUserReceived, UserDetails } from "../types/Types";
import { apiGetUserAuth, apiGetUser, apiGetUserRole } from "../api/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import TextSkeleton from "../skeleton/TextSkeleton";
import { apiFile2ClientFile } from "../utils/utils";

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

interface AuthContextType {
  user: User;
  authenticated: boolean;
  userRole: string;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserRole: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType>({
  user: EmptyUser,
  authenticated: false,
  userRole: "",
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

  // const queryUser = useQuery({
  //   queryKey: ["user", "details"],
  //   queryFn: apiGetUser,
  // });

  // const queryAuth = useQuery({
  //   queryKey: ["user", "auth"],
  //   queryFn: apiGetUserAuth,
  // });

  // const queryRole = useQuery({
  //   queryKey: ["user", "role"],
  //   queryFn: apiGetUserRole,
  // });

  // if (
  //   queryUser.status === "pending" ||
  //   queryAuth.status === "pending" ||
  //   queryRole.status === "pending"
  // ) {
  //   return <TextSkeleton />;
  // }

  // useEffect(() => {
  //   if (queryUser.status === "success") {
  //     const userReceived = queryUser.data as APIUserReceived;
  //     const details: UserDetails = userReceived.userDetails;
  //     const avatar: File | null = apiFile2ClientFile(
  //       userReceived.avatarImageB64,
  //     );
  //     setUser({
  //       ...details,
  //       avatar: avatar,
  //     });
  //   }

  //   if (queryAuth.status === "success") {
  //     setAuthenticated(queryAuth.data);
  //   }

  //   if (queryRole.status === "success") {
  //     setUserRole(queryRole.data);
  //   }
  // }, [queryUser, queryAuth, queryRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        userRole,
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
