import React from "react";
import Title from "./Title";
import SearchBar from "./SearchBar";

const gradientBackground = "linear-gradient(to right, #5aeb26, #2c9e03)";

const SearchProperties: React.FC = () => {
  return (
    <div
      style={{ background: gradientBackground, padding: "20px" }}
      className="text-center rounded mx-auto my-3"
    >
      <Title
        title="Search Properties"
        description="Locate your new home!"
      ></Title>
      <SearchBar placeholder="Search Proprties in the USA"></SearchBar>
    </div>
  );
};

export default SearchProperties;
