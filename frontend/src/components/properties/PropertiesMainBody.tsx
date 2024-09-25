import React, { useState, useEffect } from "react";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../../constants";
import CardGridSkeleton from "../../skeleton/CardGridSkeleton";
import SearchBar from "../../input/SearchBar";
import PageOfProperties from "./PageOfProperties";
import { useSearchParams } from "react-router-dom";
import SubmitButton from "../buttons/SubmitButton";
import FetchErrorText from "../FetchErrorText";
import { pageQPKey, filterAddressQPKey } from "../../constants";
import { useGetPageOfPropertyIDs } from "../../hooks/properties";
import "../../styles/contentBody.css";
import "../../styles/form.css";
import PaginationButtons from "../PaginationButtons";
import {
  useGetPageNumSearchQueryParam,
  useGetURLSearchQueryParam,
} from "../../hooks/react-router";
import {
  getURLSearchQueryParam,
  updateURLSearchQueryParam,
} from "../../react_router/react-router";

const PropertiesMainBody: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Init our states from the query params
  // Current page number
  const [currentPage, _setCurrentPage] = useState<number>(
    useGetPageNumSearchQueryParam(),
  );
  const setCurrentPage = (page: number) => {
    _setCurrentPage(page);
    updateURLSearchQueryParam(setSearchParams, pageQPKey, page.toString());
  };
  // Filter - address
  const [filterAddress, setFilterAddress] = useState<string>(
    useGetURLSearchQueryParam(filterAddressQPKey, ""),
  );

  // Use react query hook to handle our data fetching and async state w/ caching of query results.
  const query = useGetPageOfPropertyIDs(currentPage, filterAddress);

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

  useEffect(() => {
    if (query.status === "success") {
      setSearchIsSubmitting(false);
    }
  }, [query.status, query.isRefetching]);

  // When new search is fired off, get the latest address filter
  useEffect(() => {
    if (searchIsSubmitting) {
      const filterAddressTmp = getURLSearchQueryParam(
        searchParams,
        filterAddressQPKey,
        "",
      );
      setCurrentPage(0);
      setFilterAddress(filterAddressTmp);
      query.refetch();
    }
  }, [searchIsSubmitting]);

  const currentPageEmpty: boolean =
    query.status === "success" && query.data.length === 0;

  const currentPagePropertyIDs = query.data ? query.data : [];

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
      {!currentPageEmpty && (
        <PageOfProperties propertyIDs={currentPagePropertyIDs} />
      )}

      {/* If no properties exist on platform, display a message. */}
      {currentPageEmpty && currentPage === 0 && (
        <FetchErrorText>
          Sorry, there are no properties on Coop right now! There will be
          listings soon, we promise.
        </FetchErrorText>
      )}

      {currentPageEmpty && currentPage !== 0 && (
        <p>No more properties to show!</p>
      )}

      {/* Pagination navigation buttons. */}
      {(!currentPageEmpty || currentPage > 0) && (
        <PaginationButtons
          currentPage={currentPage}
          currentPageSize={currentPagePropertyIDs.length}
          setSize={MAX_NUMBER_PROPERTIES_PER_PAGE}
          handleNavPage={handleNavPage}
          handleNextPage={handleNextPage}
        />
      )}
    </>
  );
};

export default PropertiesMainBody;
