import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetCommunities } from "../api/api";
import CardGridSkeleton from "../skeleton/CardGridSkeleton";
import PageOfCommunities from "./PageOfCommunities";

import Title from "../components/Title";
import SearchBar from "../input/SearchBar";
import "../styles/colors.css";
import SubmitButton from "../components/SubmitButton";
import { useSearchParams } from "react-router-dom";
import {
  pageQPKey,
  filterNameQPKey,
  filterDescriptionQPKey,
  MAX_NUMBER_COMMUNITIES_PER_PAGE,
} from "../constants";

const CommunitiesMainBody: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [pages, setPages] = useState<Map<number, string[]>>(new Map()); // <page num, property ids>

  // Grab the search params, to init our state.
  let startPage: string | null = searchParams.get(pageQPKey);
  let startPageNum: number;
  if (startPage !== null && startPage.length > 0) {
    // use the given page num, or use 0 if not a valid number
    startPage = startPage as string;
    startPageNum = Number(startPage);
    if (Number.isNaN(startPageNum)) {
      startPageNum = 0;
    }
    if (startPageNum < 0) {
      startPageNum = 0;
    }
  } else {
    // not given, start with first page (0)
    startPageNum = 0;
    searchParams.set(pageQPKey, `${startPageNum}`);
    setSearchParams(searchParams);
  }

  let filterNameQP: string | null = searchParams.get(filterNameQPKey);
  let filterNameStr: string;
  if (filterNameQP !== null) {
    filterNameStr = filterNameQP as string;
  } else {
    filterNameStr = "";
  }

  let filterDescriptionQP: string | null = searchParams.get(
    filterDescriptionQPKey,
  );
  let filterDescriptionStr: string;
  if (filterDescriptionQP !== null) {
    filterDescriptionStr = filterDescriptionQP as string;
  } else {
    filterDescriptionStr = "";
  }

  // Init our state from the query params
  const [name, setName] = useState<string>(filterNameStr);
  const [description, setDescription] = useState<string>(filterDescriptionStr);
  const [currentPage, _setCurrentPage] = useState<number>(startPageNum);
  const setCurrentPage = (page: number) => {
    // Want to update the query param for page number whenever the page
    // state is updated. This is fired by the pagination navigation buttons.
    // The other filters handled by the input forms are automatically handled by
    // the binding between the input elements and the query params.
    _setCurrentPage(page);
    searchParams.set(pageQPKey, `${page}`);
    setSearchParams(searchParams);
  };

  // Use react query hook to handle our data fetching and async state w/ caching of query results.
  const query = useQuery({
    queryKey: ["communitiesPage", currentPage, name, description],
    queryFn: () => apiGetCommunities(currentPage, name, description),
  });
  // Use query client hook to get the query client for access to the cache
  const queryClient = useQueryClient();

  // Define search form submission handler
  const searchCommunitiesWithFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchIsSubmitting(true);
  };

  // Define pagination functions
  const handleNavPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = e.target as HTMLElement;
    const pageToGoTo = Number(element.innerHTML) - 1;
    setCurrentPage(pageToGoTo);
  };

  const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const pageToGoTo = currentPage + 1;
    setCurrentPage(pageToGoTo);
  };

  // Watch changes to query for fetching of new pages if not in cache
  useEffect(() => {
    if (query.status === "success") {
      const newPage = query.data as string[];
      setPages((prevPages) => new Map(prevPages).set(currentPage, newPage));
      setSearchIsSubmitting(false);
    }
  }, [query.status, query.isRefetching]); // add isRefetching to dependency to allow us to use pages that were cached from previous queries

  // When new search is fired off, get the latest address filter
  useEffect(() => {
    if (searchIsSubmitting) {
      let filterNameTmp: string | null = searchParams.get(filterNameQPKey);
      if (filterNameTmp === null) {
        filterNameTmp = "";
      }
      let filterDescriptionTmp: string | null = searchParams.get(
        filterDescriptionQPKey,
      );
      if (filterDescriptionTmp === null) {
        filterDescriptionTmp = "";
      }

      // See if first page of the search is already cached.
      const pageCached: string[] | undefined = queryClient.getQueryData([
        "communitiesPage",
        0,
        filterNameTmp,
        filterDescriptionTmp,
      ]);

      // If page exists, then just use that page and don't
      // update states to trigger a new fetch.
      if (pageCached !== undefined) {
        setPages(() => new Map().set(0, pageCached));
        setSearchIsSubmitting(false);
        return;
      }

      // Update filter variables to trigger fetch.
      setCurrentPage(0);
      setName(filterNameTmp);
      setDescription(filterDescriptionTmp);
    }
  }, [searchIsSubmitting]);

  const noCommunitiesOnPlatform: boolean =
    query.status === "success" && pages.get(0)?.length === 0;

  return (
    <>
      {/* Aesthetic Banner */}
      <div className="banner__blue">
        <Title
          title="Search Communities"
          description="Find people with similar interests!"
        ></Title>
      </div>

      {/* Input form for applying filters to search */}
      <form
        className="form__searchCommunities"
        onSubmit={searchCommunitiesWithFilters}
      >
        <div className="flex-col flex-grow">
          <label className="text_input_field_label_gray">Name</label>
          <SearchBar
            searchQueryParamKey={filterNameQPKey}
            placeholder="Name"
          ></SearchBar>
        </div>
        <div className="flex-col flex-grow">
          <label className="text_input_field_label_gray">Description</label>
          <SearchBar
            searchQueryParamKey={filterDescriptionQPKey}
            placeholder="Description"
          ></SearchBar>
        </div>
        <SubmitButton isSubmitting={searchIsSubmitting} />
      </form>

      {/* Display of Page of Communities */}
      {/* If query is pending, display a skeleton. */}
      {query.status === "pending" && <CardGridSkeleton />}

      {/* If query is successful and there are communities, then show the current page of them! */}
      {pages.has(currentPage) && (
        <PageOfCommunities
          key={currentPage}
          communityIDs={pages.get(currentPage) as string[]}
        />
      )}

      {/* If no communities exist on platform, display a message. */}
      {noCommunitiesOnPlatform && (
        <h1 className="text-center text-red-600 text-xl font-bold">
          Sorry, there are no communities on Coop right now! Create your own or
          come back later.
        </h1>
      )}

      {/* Flex box for the pagination navigation buttons. */}
      {!noCommunitiesOnPlatform && (
        <div
          id="CommunitiesMainBody__navigationBtnsContainer"
          className="flex gap-1"
        >
          {Array(currentPage + 1)
            .fill(0)
            .map((_, i) => i * 1)
            .map((pageNum) => (
              <button
                key={pageNum}
                className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
                disabled={currentPage === pageNum}
                onClick={handleNavPage}
              >
                {pageNum + 1}
              </button>
            ))}
          {pages.has(currentPage) &&
            (pages.get(currentPage) as string[]).length ===
              MAX_NUMBER_COMMUNITIES_PER_PAGE && (
              <button
                key="next"
                className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded"
                onClick={handleNextPage}
              >
                Next
              </button>
            )}
        </div>
      )}
    </>
  );
};
export default CommunitiesMainBody;
