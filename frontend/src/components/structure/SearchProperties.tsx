import React from "react";
import Title from "./Title";
import SearchBar from "./SearchBar";

const gradientBackground = "linear-gradient(to right, #5aeb26, #2c9e03)";

const SearchProperties: React.FC = () => {
  return (
    <div
      style={{ background: gradientBackground, padding: '20px'}}
      className="w-4/5 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 text-center rounded mx-auto my-3"
    >
      <Title title="Search Properties" description="Locate your new home!"></Title>
      <SearchBar placeholder="Search Proprties in the USA"></SearchBar>
    </div>
  );
};

export default SearchProperties;
