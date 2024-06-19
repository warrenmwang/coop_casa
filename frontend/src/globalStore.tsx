import React, { createContext, ReactNode, useContext, useState} from "react";
import { Property } from "./components/structure/CreatePropertyForm";

interface GlobalStoreContextType {
  currProperties: Property[];
  setCurrProperties: React.Dispatch<React.SetStateAction<Property[]>>;
}

const GlobalStoreContext = createContext<GlobalStoreContextType>({
  currProperties: [],
  setCurrProperties: () => {},
});

export const GlobalStore = () => useContext(GlobalStoreContext);

const GlobalStoreWrapper: React.FC<{children: ReactNode}> = ({children}) => {
  const [ currProperties, setCurrProperties ] = useState([] as Property[]);

  return(
    <GlobalStoreContext.Provider value={
      {
        currProperties,
        setCurrProperties
      }
    }>
      {children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreWrapper;