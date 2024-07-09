import React, { createContext, ReactNode, useContext } from "react";
import { Property } from "./form/CreatePropertyForm";

interface GlobalStoreContextType {
  globalMap: Map<string, any>;
}

const GlobalStoreContext = createContext<GlobalStoreContextType>({
  globalMap: new Map<string, any>(),
});

export const GlobalStore = () => useContext(GlobalStoreContext);

const GlobalStoreWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const globalMap = new Map<string, any>();
  globalMap.set("cachedProperties", new Map<string, Property>()); // propertyID -> Property

  return (
    <GlobalStoreContext.Provider
      value={{
        globalMap,
      }}
    >
      {children}
    </GlobalStoreContext.Provider>
  );
};

export default GlobalStoreWrapper;
