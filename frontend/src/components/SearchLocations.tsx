import React from "react";
import Title from "./Title";
import SearchBar from "./SearchBar";

const gradientBackground = "linear-gradient(to right, #5aeb26, #2c9e03)";

const SearchLocations: React.FC = () => {
  return (
    <div style={{ background: gradientBackground, padding: '20px'}}>
      <div>
        <Title title="Search Locations" description="Locate your new home!"></Title>
        <SearchBar placeholder="Search Locations in the USA"></SearchBar>
      </div>
    </div>
  );
};

export default SearchLocations;
