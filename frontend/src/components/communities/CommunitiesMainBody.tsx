import React, { useState, useEffect } from "react";
import CardGridSkeleton from "../../skeleton/CardGridSkeleton";
import PageOfCommunities from "./PageOfCommunities";

import SearchBar from "../../input/SearchBar";

import SubmitButton from "../buttons/SubmitButton";
import { useSearchParams } from "react-router-dom";
import {
  pageQPKey,
  filterNameQPKey,
  filterDescriptionQPKey,
  MAX_NUMBER_COMMUNITIES_PER_PAGE,
} from "../../constants";
import FetchErrorText from "../FetchErrorText";
import { useGetPageOfCommunityIDs } from "../../hooks/communities";
import PaginationButtons from "../PaginationButtons";
import {
  useGetPageNumSearchQueryParam,
  useGetURLSearchQueryParam,
} from "../../hooks/react-router";
import {
  getURLSearchQueryParam,
  updateURLSearchQueryParam,
} from "../../react_router/react-router";

const CommunitiesMainBody: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Init our state from the query params
  const [name, setName] = useState<string>(
    useGetURLSearchQueryParam(filterNameQPKey, ""),
  );
  const [description, setDescription] = useState<string>(
    useGetURLSearchQueryParam(filterDescriptionQPKey, ""),
  );
  const [currentPage, _setCurrentPage] = useState<number>(
    useGetPageNumSearchQueryParam(),
  );
  const setCurrentPage = (page: number) => {
    // Want to update the query param for page number whenever the page
    // state is updated. This is fired by the pagination navigation buttons.
    // The other filters handled by the input forms are automatically handled by
    // the binding between the input elements and the query params.
    _setCurrentPage(page);
    updateURLSearchQueryParam(setSearchParams, pageQPKey, page.toString());
  };

  // Use react query hook to handle our data fetching and async state w/ caching of query results.
  const query = useGetPageOfCommunityIDs(currentPage, name, description);
  // Use query client hook to get the query client for access to the cache

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

  useEffect(() => {
    if (query.status === "success") {
      setSearchIsSubmitting(false);
    }
  }, [query.status, query.isRefetching]);

  // When new search is fired off, get the latest search filters
  useEffect(() => {
    if (searchIsSubmitting) {
      const filterName = getURLSearchQueryParam(
        searchParams,
        filterNameQPKey,
        "",
      );
      const filterDescription = getURLSearchQueryParam(
        searchParams,
        filterDescriptionQPKey,
        "",
      );
      setName(filterName);
      setDescription(filterDescription);
      query.refetch();
    }
  }, [searchIsSubmitting]);

  const currentPageEmpty: boolean =
    query.status === "success" && query.data.length === 0;
  const currentPageCommunityIDs = query.data ? query.data : [];

  return (
    <>
      {/* Input form for applying filters to search */}
      <form
        className="form__searchCommunities"
        onSubmit={searchCommunitiesWithFilters}
      >
        <div className="flex-col flex-grow items-center">
          <label className="label__text_input_gray">Name</label>
          <SearchBar
            searchQueryParamKey={filterNameQPKey}
            placeholder="Name"
          ></SearchBar>
        </div>
        <div className="flex-col flex-grow">
          <label className="label__text_input_gray">Description</label>
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
      {!currentPageEmpty && (
        <PageOfCommunities communityIDs={currentPageCommunityIDs} />
      )}

      {currentPageEmpty && currentPage === 0 && (
        <FetchErrorText>
          Sorry, there are no communities on Coop right now! Create your own or
          come back later.
        </FetchErrorText>
      )}

      {currentPageEmpty && currentPage !== 0 && (
        <p>No more communities to show!</p>
      )}

      {/* Flex box for the pagination navigation buttons. */}
      {(!currentPageEmpty || currentPage > 0) && (
        <PaginationButtons
          currentPage={currentPage}
          currentPageSize={currentPageCommunityIDs.length}
          setSize={MAX_NUMBER_COMMUNITIES_PER_PAGE}
          handleNavPage={handleNavPage}
          handleNextPage={handleNextPage}
        />
      )}
    </>
  );
};
export default CommunitiesMainBody;
