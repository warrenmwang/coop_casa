import React from "react";
import { useSearchParams } from "react-router-dom";
import Title from "../components/Title";
import SearchBar from "./SearchBar";

const gradientBackground = "linear-gradient(to right, #5aeb26, #2c9e03)";

const SearchProperties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onSubmit = (searchText: string) => {
    console.log("search properties: " + searchText);
    // TODO: query the backend using a fuzzy string match to retrieve the top k closest properties
    // based on what? name (arbitrary), location or description?
  };

  return (
    <div
      style={{ background: gradientBackground, padding: "20px" }}
      className="text-center rounded mx-auto my-3"
    >
      <Title
        title="Search Properties"
        description="Locate your new home!"
      ></Title>
      <SearchBar
        onSubmit={onSubmit}
        placeholder="Find your next forever home with your buddies!"
      ></SearchBar>
    </div>
  );
};

export default SearchProperties;
