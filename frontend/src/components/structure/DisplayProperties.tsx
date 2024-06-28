import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { apiGetProperties, apiGetProperty } from "../../api/api";
import CardGridSkeleton from "./CardGridSkeleton";
import PropertyCard from "./PropertyCard";
import SearchProperties from "./SearchProperties";
import { Property } from "./CreatePropertyForm";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { MAX_NUMBER_PROPERTIES_PER_PAGE } from "../../constants";
import CardSkeleton from "./CardSkeleton";

interface DisplayPropertiesProps {}

type PageOfPropertiesProps = {
  propertyIDs: string[];
};
const PageOfProperties: React.FC<PageOfPropertiesProps> = ({ propertyIDs }) => {
  const propertyQueries = useQueries({
    queries: propertyIDs.map((propertyID) => {
      return {
        queryKey: ["properties", propertyID],
        queryFn: () => apiGetProperty(propertyID),
      };
    }),
  });

  const properties = propertyQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    });

  return (
    <Grid container spacing={2}>
      {properties.map((value: Property, index: number) => (
        <Grid
          key={index}
          item
          xs={12}
          sm={12}
          md={6}
          lg={6}
          xl={4}
          style={{ gap: "0 24px" }}
        >
          <PropertyCard property={value} />
        </Grid>
      ))}
    </Grid>
  );
};

const DisplayProperties: React.FC<DisplayPropertiesProps> = () => {
  // TODO: need this for filtering search information?
  const [searchParams, setSearchParams] = useSearchParams();

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

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <>
      <SearchProperties />
      {status == "pending" && <CardGridSkeleton />}
      {(status == "success" || data !== undefined) &&
        data.pages.map((page) => {
          const propertyIDs = page.data;
          return (
            <div key={page.currentPage} className="flex justify-center">
              <PageOfProperties propertyIDs={propertyIDs} />
            </div>
          );
        })}
      {status == "error" && (
        <h1 className="text-xl text-red-600 font-bold flex justify-center">
          Sorry, we are unable to find any properties at the moment. Please come
          back again later. Server returned with error: {JSON.stringify(error)}
        </h1>
      )}
      <div ref={ref}></div>
      {isFetchingNextPage && <CardSkeleton />}
      {!hasNextPage && (
        <div className="flex justify-center text-gray-400 text-lg">
          No more properties to show.
        </div>
      )}
    </>
  );
};

export default DisplayProperties;
