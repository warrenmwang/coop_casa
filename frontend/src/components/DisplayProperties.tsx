import React, { useState, useEffect } from "react";
import { apiGetProperties } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../constants";
import Title from "../components/Title";
import CardGridSkeleton from "../skeleton/CardGridSkeleton";
import SearchBar from "../input/SearchBar";
import PageOfProperties from "../components/PageOfProperties";
import { useSearchParams } from "react-router-dom";
import "../styles/ContentBody.css";
import SubmitButton from "./SubmitButton";

const DisplayProperties: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState(false);
  const [searchParams, _] = useSearchParams();
  const searchQueryParamKey = "searchProperties";
  const [pages, setPages] = useState<Map<number, string[]>>(new Map()); // <page num, property ids>

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [filter, setFilter] = useState<string>("");

  const searchPropertiesWithFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchIsSubmitting(true);
  };

  const query = useQuery({
    queryKey: ["propertiesPage", currentPage, filter],
    queryFn: () => apiGetProperties(currentPage, filter),
  });

  const handleNavPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = e.target as HTMLElement;
    const pageToGoTo = Number(element.innerHTML) - 1;
    setCurrentPage(pageToGoTo);
  };

  const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // const element = e.target as HTMLElement;
    const pageToGoTo = currentPage + 1;
    setCurrentPage(pageToGoTo);
  };

  // update cache of pages
  useEffect(() => {
    if (query.status === "success") {
      const newPage = query.data as string[];
      setPages((prevPages) => new Map(prevPages).set(currentPage, newPage));
    }
  }, [query.status]);

  // fetching a new page
  useEffect(() => {
    if (searchIsSubmitting) {
      const filter = searchParams.get(searchQueryParamKey);
      setFilter(filter as string);
      setSearchIsSubmitting(false);
    }
  }, [searchIsSubmitting]);

  // change current page displayed

  return (
    <div className="content-body">
      <Title
        title="Properties on Coop"
        description="Browse to find your desired property to co-own with your buddies."
      />

      <form
        className="flex justify-center gap-2 p-3"
        onSubmit={searchPropertiesWithFilter}
      >
        <SearchBar
          searchQueryParamKey={searchQueryParamKey}
          placeholder="Search by address."
        ></SearchBar>
        <SubmitButton isSubmitting={searchIsSubmitting} />
      </form>

      {query.status === "pending" && <CardGridSkeleton />}

      {pages.has(currentPage) && (
        <PageOfProperties
          key={currentPage}
          propertyIDs={pages.get(currentPage) as string[]}
        />
      )}

      <div
        id="DisplayProperties__navigationBtnsContainer"
        className="flex gap-1"
      >
        {Array.from(pages.entries()).map((_, key) => (
          <button
            key={key}
            className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
            disabled={currentPage === key}
            onClick={handleNavPage}
          >
            {key + 1}
          </button>
        ))}
        {pages.has(currentPage) &&
          (pages.get(currentPage) as string[]).length ===
            MAX_NUMBER_PROPERTIES_PER_PAGE && (
            <button
              key="next"
              className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
              onClick={handleNextPage}
            >
              Next
            </button>
          )}
      </div>
    </div>
  );
};

export default DisplayProperties;
