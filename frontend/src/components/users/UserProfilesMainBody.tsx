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

const UserProfilesMainBody: React.FC = () => {
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

  const filterFirstNameQP: string | null =
    searchParams.get(filterFirstNameQPKey);
  let filterFirstNameStr: string;
  if (filterFirstNameQP !== null) {
    filterFirstNameStr = filterFirstNameQP as string;
  } else {
    filterFirstNameStr = "";
  }

  const filterLastNameQP: string | null = searchParams.get(filterLastNameQPKey);
  let filterLastNameStr: string;
  if (filterLastNameQP !== null) {
    filterLastNameStr = filterLastNameQP as string;
  } else {
    filterLastNameStr = "";
  }

  // Init our state from the query params
  const [firstName, setFirstName] = useState<string>(filterFirstNameStr);
  const [lastName, setLastName] = useState<string>(filterLastNameStr);
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

  const query = useGetPageOfUserProfiles(currentPage, firstName, lastName);
  const queryClient = useQueryClient();

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

  // Watch changes to query for fetching of new pages if not in cache
  useEffect(() => {
    if (query.status === "success") {
      const newPage = query.data as string[];
      setPages((prevPages) => new Map(prevPages).set(currentPage, newPage));
      setSearchIsSubmitting(false);
    }
  }, [query.status, query.isRefetching]); // add isRefetching to dependency to allow us to use pages that were cached from previous queries

  // When new search is fired off, get the latest filters
  useEffect(() => {
    if (searchIsSubmitting) {
      let filterFirstNameTmp: string | null =
        searchParams.get(filterFirstNameQPKey);
      if (filterFirstNameTmp === null) {
        filterFirstNameTmp = "";
      }
      let filterLastNameTmp: string | null =
        searchParams.get(filterLastNameQPKey);
      if (filterLastNameTmp === null) {
        filterLastNameTmp = "";
      }

      // See if first page of the search is already cached.
      const pageCached: string[] | undefined = queryClient.getQueryData([
        "userProfilesPage",
        0,
        filterFirstNameTmp,
        filterLastNameTmp,
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
      setFirstName(filterFirstNameTmp);
      setLastName(filterLastNameTmp);
    }
  }, [searchIsSubmitting]);

  const noUserProfilesOnPlatform: boolean =
    query.status === "success" && pages.get(0)?.length === 0;

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
      {pages.has(currentPage) && (
        <PageOfUserProfiles
          key={currentPage}
          userIDs={pages.get(currentPage) as string[]}
        />
      )}

      {/* If no user profiles exist on platform, display a message. */}
      {noUserProfilesOnPlatform && (
        <FetchErrorText>
          Sorry, there are no user profiles on Coop right now! Create your own
          account to be the first one!
        </FetchErrorText>
      )}

      {/* Flex box for the pagination navigation buttons. */}
      {!noUserProfilesOnPlatform && (
        <PaginationButtons
          currentPage={currentPage}
          pages={pages}
          setSize={MAX_NUMBER_USER_PROFILES_PER_PAGE}
          handleNavPage={handleNavPage}
          handleNextPage={handleNextPage}
        />
      )}
    </>
  );
};

export default UserProfilesMainBody;
