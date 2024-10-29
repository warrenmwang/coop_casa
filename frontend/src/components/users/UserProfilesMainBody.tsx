import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FILTER_FIRST_NAME_QP_KEY,
  FILTER_LAST_NAME_QP_KEY,
  MAX_NUMBER_USER_PROFILES_PER_PAGE,
  PAGE_QP_KEY,
} from "@app/appConstants";
import FetchErrorText from "@app/components/FetchErrorText";
import CardGridSkeleton from "@app/components/skeleton/CardGridSkeleton";
import SearchBar from "@app/components/input/SearchBar";
import SubmitButton from "@app/components/buttons/SubmitButton";
import PageOfUserProfiles from "@app/components/users/PageOfUserProfiles";
import { useGetPageOfUserProfiles } from "@app/hooks/users";
import PaginationButtons from "@app/components/PaginationButtons";
import {
  useGetPageNumSearchQueryParam,
  useGetURLSearchQueryParam,
} from "@app/hooks/react-router";
import {
  getURLSearchQueryParam,
  updateURLSearchQueryParam,
} from "@app/react_router/react-router";

const UserProfilesMainBody: React.FC = () => {
  const [searchIsSubmitting, setSearchIsSubmitting] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Init our state from the query params
  const [currentPage, _setCurrentPage] = useState<number>(
    useGetPageNumSearchQueryParam(),
  );
  const [firstName, setFirstName] = useState<string>(
    useGetURLSearchQueryParam(FILTER_FIRST_NAME_QP_KEY, ""),
  );
  const [lastName, setLastName] = useState<string>(
    useGetURLSearchQueryParam(FILTER_LAST_NAME_QP_KEY, ""),
  );
  const setCurrentPage = (page: number) => {
    // Want to update the query param for page number whenever the page
    // state is updated. This is fired by the pagination navigation buttons.
    // The other filters handled by the input forms are automatically handled by
    // the binding between the input elements and the query params.
    _setCurrentPage(page);
    updateURLSearchQueryParam(setSearchParams, PAGE_QP_KEY, page.toString());
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
        FILTER_FIRST_NAME_QP_KEY,
        "",
      );
      const filterLastNameTmp = getURLSearchQueryParam(
        searchParams,
        FILTER_LAST_NAME_QP_KEY,
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
    query.status === "error" ||
    (query.status === "success" && query.data.length === 0);

  const currentPageUserIDs = query.data ? query.data : [];

  return (
    <>
      {/* Input form for applying filters to search */}
      <form className="form__searchUserProfiles" onSubmit={handleFormSubmit}>
        <div className="flex-col flex-grow items-center">
          <label htmlFor="first-name-input" className="label__text_input_gray">
            First Name
          </label>
          <SearchBar
            id="first-name-input"
            searchQueryParamKey={FILTER_FIRST_NAME_QP_KEY}
            placeholder="First Name"
          ></SearchBar>
        </div>
        <div className="flex-col flex-grow">
          <label htmlFor="last-name-input" className="label__text_input_gray">
            Last Name
          </label>
          <SearchBar
            id="last-name-input"
            searchQueryParamKey={FILTER_LAST_NAME_QP_KEY}
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
