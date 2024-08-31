import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../constants";
import CardGridSkeleton from "../skeleton/CardGridSkeleton";
import SearchBar from "../input/SearchBar";
import PageOfProperties from "./PageOfProperties";
import { useSearchParams } from "react-router-dom";
import SubmitButton from "./SubmitButton";
import "../styles/contentBody.css";
import "../styles/form.css";
import FetchErrorText from "./FetchErrorText";
import { pageQPKey, filterAddressQPKey } from "../constants";
import { useGetPageOfPropertyIDs } from "../hooks/properties";

const PropertiesMainBody: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [pages, setPages] = useState<Map<number, string[]>>(new Map()); // <page num, property ids>

  // Sync query params with state
  // page num
  let pageQP: string | null = searchParams.get(pageQPKey);
  let startPageNum: number;
  if (pageQP !== null && pageQP.length > 0) {
    // use the given page num, or use 0 if not a valid number
    pageQP = pageQP as string;
    startPageNum = Number(pageQP);
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

  const filterAddressQP: string | null = searchParams.get(filterAddressQPKey);
  let filterAddressStr: string;
  if (filterAddressQP !== null) {
    filterAddressStr = filterAddressQP as string;
  } else {
    filterAddressStr = "";
  }

  // Init our states from the query params
  // Current page number
  const [currentPage, _setCurrentPage] = useState<number>(startPageNum);
  const setCurrentPage = (page: number) => {
    _setCurrentPage(page);
    searchParams.set(pageQPKey, `${page}`);
    setSearchParams(searchParams);
  };
  // Filter - address
  const [filterAddress, setFilterAddress] = useState<string>(filterAddressStr);

  // Use react query hook to handle our data fetching and async state w/ caching of query results.
  const query = useGetPageOfPropertyIDs(currentPage, filterAddress);
  // Use query client hook to get the query client for access to the cache
  const queryClient = useQueryClient();

  // Define search form submission handler
  const searchPropertiesWithFilter = (e: React.FormEvent) => {
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
      let filterAddressTmp: string | null =
        searchParams.get(filterAddressQPKey);
      if (filterAddressTmp === null) {
        filterAddressTmp = "";
      }

      // See if first page of the search is already cached.
      const pageCached: string[] | undefined = queryClient.getQueryData([
        "propertiesPage",
        0,
        filterAddressTmp,
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
      setFilterAddress(filterAddressTmp);
    }
  }, [searchIsSubmitting]);

  const noPropertiesOnPlatform: boolean =
    query.status === "success" && pages.get(0)?.length === 0;

  return (
    <>
      {/* Input form for applying filters to search */}
      <form
        className="form__searchProperties"
        onSubmit={searchPropertiesWithFilter}
      >
        <div className="flex-col flex-grow">
          <label className="label__text_input_gray">Address</label>
          <SearchBar
            searchQueryParamKey={filterAddressQPKey}
            placeholder="Search by address."
          ></SearchBar>
        </div>
        <SubmitButton isSubmitting={searchIsSubmitting} />
      </form>

      {/* Display of Page of Properties */}
      {/* If query is pending, display a skeleton. */}
      {query.status === "pending" && <CardGridSkeleton />}

      {/* If query is successful and there are properties, then show the current page of them! */}
      {pages.has(currentPage) && (
        <PageOfProperties
          key={currentPage}
          propertyIDs={pages.get(currentPage) as string[]}
        />
      )}

      {/* If no properties exist on platform, display a message. */}
      {noPropertiesOnPlatform && (
        <FetchErrorText>
          Sorry, there are no properties on Coop right now! There will be
          listings soon, we promise.
        </FetchErrorText>
      )}

      {/* Flex box for the pagination navigation buttons. */}
      {!noPropertiesOnPlatform && (
        <div
          id="DisplayProperties__navigationBtnsContainer"
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
      )}
    </>
  );
};

export default PropertiesMainBody;
