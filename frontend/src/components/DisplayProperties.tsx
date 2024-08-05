import React, { useState, useEffect } from "react";
import { apiGetProperties } from "../api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../constants";
import Title from "../components/Title";
import CardGridSkeleton from "../skeleton/CardGridSkeleton";
import SearchBar from "../input/SearchBar";
import PageOfProperties from "../components/PageOfProperties";
import { useSearchParams } from "react-router-dom";
import "../styles/contentBody.css";
import SubmitButton from "./SubmitButton";

export const filterAddressQPKey = "filterAddress";
export const pageQPKey = "page";

const DisplayProperties: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [pages, setPages] = useState<Map<number, string[]>>(new Map()); // <page num, property ids>

  // Sync query params with state
  // page num
  let startPage: string | null = searchParams.get(pageQPKey);
  let startPageNum: number;
  if (startPage !== null && startPage.length > 0) {
    // use the given page num, or use 0 if not a valid number
    startPage = startPage as string;
    startPageNum = Number(startPage);
    if (Number.isNaN(startPageNum)) {
      startPageNum = 0;
    }
  } else {
    // not given, start with first page (0)
    startPageNum = 0;
    searchParams.set(pageQPKey, `${startPageNum}`);
    setSearchParams(searchParams);
  }

  let filterAddressQP: string | null = searchParams.get(filterAddressQPKey);
  let filterAddressStr: string;
  if (filterAddressQP !== null) {
    filterAddressStr = filterAddressQP as string;
  } else {
    filterAddressStr = "";
  }

  const [currentPage, _setCurrentPage] = useState<number>(startPageNum);
  const setCurrentPage = (page: number) => {
    _setCurrentPage(page);
    searchParams.set(pageQPKey, `${page}`);
    setSearchParams(searchParams);
  };
  const [filterAddress, setFilterAddress] = useState<string>(filterAddressStr);

  const searchPropertiesWithFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchIsSubmitting(true);
  };

  const query = useQuery({
    queryKey: ["propertiesPage", currentPage, filterAddress],
    queryFn: () => apiGetProperties(currentPage, filterAddress),
  });
  const queryClient = useQueryClient();

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

  // fetches a new page if not in cache
  useEffect(() => {
    if (query.status === "success") {
      const newPage = query.data as string[];
      setPages((prevPages) => new Map(prevPages).set(currentPage, newPage));
      setSearchIsSubmitting(false);
    }
  }, [query.status, query.isRefetching]); // add isRefetching to dependency to allow us to use pages that were cached from previous queries

  // when new search is fired off, get the latest address filter
  useEffect(() => {
    if (searchIsSubmitting) {
      let filterAddress: string | null = searchParams.get(filterAddressQPKey);
      if (filterAddress === null) {
        filterAddress = "";
      }

      // see if first page of the search is already cached.
      const pageCached: string[] | undefined = queryClient.getQueryData([
        "propertiesPage",
        0,
        filterAddress,
      ]);
      if (pageCached !== undefined) {
        setPages(() => new Map().set(0, pageCached));
        setSearchIsSubmitting(false);
        return;
      }

      setCurrentPage(0);
      setFilterAddress(filterAddress);
    }
  }, [searchIsSubmitting]);

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
          searchQueryParamKey={filterAddressQPKey}
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
    </div>
  );
};

export default DisplayProperties;
