import React from "react";
import Title from "../structure/Title";
import SearchBar from "../structure/SearchBar";

const gradientBackground = "linear-gradient(to left, #40c0ff, #1482b8)";

const SearchCommunities: React.FC = () => {
  const onSubmit = (searchText: string) => {
    console.log("search communities: " + searchText);
  };

  return (
    <div
      style={{ background: gradientBackground, padding: "20px" }}
      className="text-center rounded mx-auto my-3"
    >
      <div>
        <Title
          title="Search Communities"
          description="Find people with similar interests!"
        ></Title>
        <SearchBar
          onSubmit={onSubmit}
          placeholder="Search Communities in the USA"
        ></SearchBar>
      </div>
    </div>
  );
};

export default SearchCommunities;
