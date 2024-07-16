import React, { useEffect } from "react";
import TopNavbar from "../components/TopNavbar";
import Title from "../components/Title";
import Footer from "../components/Footer";
import { useSearchParams } from "react-router-dom";
import { apiGetProperties } from "../api/api";
import CardGridSkeleton from "../skeleton/CardGridSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../constants";
import CardSkeleton from "../skeleton/CardSkeleton";
import SearchBar from "../input/SearchBar";
import PageOfProperties from "../components/PageOfProperties";
import "../styles/ContentBody.css";

const PropertiesPage: React.FC = () => {
  // TODO: use the search param to filter the search better.
  const [searchParams, _] = useSearchParams();
  const searchQueryParamKey = "searchProperties";

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

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && propertiesQuery.hasNextPage) {
      console.log("fetching next page....");
      propertiesQuery.fetchNextPage();
    }
  }, [inView, propertiesQuery]);

  return (
    <>
      <TopNavbar />

      <div className="content-body">
        <Title
          title="Properties on Coop"
          description="Browse to find your desired property to co-own with your buddies."
        />

        <SearchBar
          searchQueryParamKey={searchQueryParamKey}
          placeholder="Search by address."
        ></SearchBar>

        {propertiesQuery.status === "pending" && <CardGridSkeleton />}
        {(propertiesQuery.status === "success" ||
          propertiesQuery.data !== undefined) &&
          propertiesQuery.data.pages.map((page) => {
            const propertyIDs = page.data;
            return (
              <div key={page.currentPage} className="flex justify-center">
                <PageOfProperties propertyIDs={propertyIDs} />
              </div>
            );
          })}
        {propertiesQuery.status === "error" && (
          <h1 className="text-xl text-red-600 font-bold flex justify-center">
            Sorry, we are unable to find any properties at the moment. Please
            come back again later. Server returned with error:{" "}
            {JSON.stringify(propertiesQuery.error)}
          </h1>
        )}
        <div ref={ref}></div>
        {propertiesQuery.isFetchingNextPage && <CardSkeleton />}
        {!propertiesQuery.hasNextPage && (
          <div className="flex justify-center text-gray-400 text-lg">
            No more properties to show.
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default PropertiesPage;
