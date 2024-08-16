import React from "react";

type FetchErrorTextProps = {
  children: React.ReactNode;
};

const FetchErrorText: React.FC<FetchErrorTextProps> = ({ children }) => {
  return (
    <h1 className="text-xl text-red-600 font-bold flex justify-center">
      {children}
    </h1>
  );
};

export default FetchErrorText;
