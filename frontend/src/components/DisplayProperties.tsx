import React, { useState, useEffect } from "react";
import { apiGetProperties } from "../api/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../constants";
import Title from "../components/Title";
import CardGridSkeleton from "../skeleton/CardGridSkeleton";
import CardSkeleton from "../skeleton/CardSkeleton";
import SearchBar from "../input/SearchBar";
import PageOfProperties from "../components/PageOfProperties";
import { useSearchParams } from "react-router-dom";
import "../styles/ContentBody.css";
import debounce from "lodash/debounce";
import SubmitButton from "./SubmitButton";

const DisplayProperties: React.FC = () => {
  // console.log("DisplayProperties");

  const [searchIsSubmitting, setSearchIsSubmitting] = useState(false);
  const [searchParams, _] = useSearchParams();
  const searchQueryParamKey = "searchProperties";
  const { ref, inView } = useInView();

  const searchPropertiesWithFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchIsSubmitting(true);
  };

  const fetchProperties = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<{
    data: string[];
    currentPage: number;
    nextPage: number | null;
  }> => {
    const propertyIDs = await apiGetProperties(pageParam);
    return new Promise((resolve) =>
      resolve({
        data: propertyIDs,
        currentPage: pageParam,
        nextPage:
          propertyIDs.length === MAX_NUMBER_PROPERTIES_PER_PAGE
            ? pageParam + 1
            : null,
      }),
    );
  };

  const propertiesQuery = useInfiniteQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const debouncedFetchNextPage = debounce((inView, propertiesQuery) => {
    if (inView && propertiesQuery.hasNextPage) {
      propertiesQuery.fetchNextPage();
    }
  }, 500);

  useEffect(() => {
    debouncedFetchNextPage(inView, propertiesQuery);
  }, [debouncedFetchNextPage, inView, propertiesQuery]);

  useEffect(() => {
    if (searchIsSubmitting) {
      // TODO:
      const filter = searchParams.get(searchQueryParamKey);
      console.log(`firing off new search with filter ${filter}`);
      setSearchIsSubmitting(false);
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
          searchQueryParamKey={searchQueryParamKey}
          placeholder="Search by address."
        ></SearchBar>
        <SubmitButton isSubmitting={searchIsSubmitting} />
      </form>

      {propertiesQuery.status === "pending" && <CardGridSkeleton />}

      {(propertiesQuery.status === "success" ||
        propertiesQuery.data !== undefined) &&
        propertiesQuery.data.pages.map((page) => (
          <PageOfProperties key={page.currentPage} propertyIDs={page.data} />
        ))}

      {propertiesQuery.status === "error" && (
        <h1 className="text-xl text-red-600 font-bold flex justify-center">
          Sorry, we are unable to find any properties at the moment. Please come
          back again later. Server returned with error:{" "}
          {JSON.stringify(propertiesQuery.error)}
        </h1>
      )}

      {propertiesQuery.isFetchingNextPage && <CardSkeleton />}

      {!propertiesQuery.hasNextPage && (
        <div className="flex justify-center text-gray-400 text-lg">
          No more properties to show.
        </div>
      )}
      <div ref={ref}></div>
    </div>
  );
};

export default DisplayProperties;
