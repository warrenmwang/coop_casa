import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  filterFirstNameQPKey,
  filterLastNameQPKey,
  MAX_NUMBER_USER_PROFILES_PER_PAGE,
  pageQPKey,
} from "../../constants";
import { useQueryClient } from "@tanstack/react-query";
import FetchErrorText from "../FetchErrorText";
import CardGridSkeleton from "../../skeleton/CardGridSkeleton";
import SearchBar from "../../input/SearchBar";
import SubmitButton from "../buttons/SubmitButton";
import PageOfUserProfiles from "./PageOfUserProfiles";
import { useGetPageOfUserProfiles } from "../../hooks/users";
import PaginationButtons from "../PaginationButtons";
import {
  useGetPageNumSearchQueryParam,
  useGetURLSearchQueryParam,
} from "../../hooks/react-router";
import {
  getURLSearchQueryParam,
  updateURLSearchQueryParam,
} from "../../react_router/react-router";

const UserProfilesMainBody: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Init our state from the query params
  const [currentPage, _setCurrentPage] = useState<number>(
    useGetPageNumSearchQueryParam(),
  );
  const [firstName, setFirstName] = useState<string>(
    useGetURLSearchQueryParam(filterFirstNameQPKey, ""),
  );
  const [lastName, setLastName] = useState<string>(
    useGetURLSearchQueryParam(filterLastNameQPKey, ""),
  );
  const setCurrentPage = (page: number) => {
    // Want to update the query param for page number whenever the page
    // state is updated. This is fired by the pagination navigation buttons.
    // The other filters handled by the input forms are automatically handled by
    // the binding between the input elements and the query params.
    _setCurrentPage(page);
    updateURLSearchQueryParam(setSearchParams, pageQPKey, page.toString());
  };

  const query = useGetPageOfUserProfiles(currentPage, firstName, lastName);

  // Define search form submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
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

  // When new search is fired off, get the latest filters
  useEffect(() => {
    if (searchIsSubmitting) {
      const filterFirstNameTmp = getURLSearchQueryParam(
        searchParams,
        filterFirstNameQPKey,
        "",
      );
      const filterLastNameTmp = getURLSearchQueryParam(
        searchParams,
        filterLastNameQPKey,
        "",
      );

      // Update filter variables to trigger fetch.
      setCurrentPage(0);
      setFirstName(filterFirstNameTmp);
      setLastName(filterLastNameTmp);
      query.refetch();
    }
  }, [searchIsSubmitting]);

  const noUserProfilesOnPlatform: boolean =
    query.status === "success" && query.data.length === 0;

  const currentPageUserIDs = query.data ? query.data : [];

  return (
    <>
      {/* Input form for applying filters to search */}
      <form className="form__searchUserProfiles" onSubmit={handleFormSubmit}>
        <div className="flex-col flex-grow items-center">
          <label className="label__text_input_gray">First Name</label>
          <SearchBar
            searchQueryParamKey={filterFirstNameQPKey}
            placeholder="First Name"
          ></SearchBar>
        </div>
        <div className="flex-col flex-grow">
          <label className="label__text_input_gray">Last Name</label>
          <SearchBar
            searchQueryParamKey={filterLastNameQPKey}
            placeholder="Last Name"
          ></SearchBar>
        </div>
        <SubmitButton isSubmitting={searchIsSubmitting} />
      </form>

      {/* Display of Page of User Profiles */}
      {/* If query is pending, display a skeleton. */}
      {query.status === "pending" && <CardGridSkeleton />}

      {/* If query is successful and there are user profiles, then show the current page of them! */}
      {!noUserProfilesOnPlatform && (
        <PageOfUserProfiles userIDs={currentPageUserIDs} />
      )}

      {/* If no user profiles exist on platform, display a message. */}
      {noUserProfilesOnPlatform && (
        <FetchErrorText>
          Sorry, there are no user profiles on Coop right now! Create your own
          account to be the first one!
        </FetchErrorText>
      )}

      {/* Flex box for the pagination navigation buttons. */}
      {(!noUserProfilesOnPlatform || currentPage > 0) && (
        <PaginationButtons
          currentPage={currentPage}
          currentPageSize={currentPageUserIDs.length}
          setSize={MAX_NUMBER_USER_PROFILES_PER_PAGE}
          handleNavPage={handleNavPage}
          handleNextPage={handleNextPage}
        />
      )}
    </>
  );
};

export default UserProfilesMainBody;
