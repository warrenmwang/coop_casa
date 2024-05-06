import { createContext, useContext, useState } from "react";

interface AuthContextType {
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default {};