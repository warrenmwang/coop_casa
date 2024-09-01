import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiGetProperties, apiGetProperty } from "../api/property";
import { Property } from "../types/Types";
import { propertiesKey, propertiesPageKey } from "../reactQueryKeys";

export const useGetPageOfPropertyIDs = (
  currentPage: number,
  filterAddress: string,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: [...propertiesPageKey, currentPage, filterAddress],
    queryFn: () => apiGetProperties(currentPage, filterAddress),
  });
};

export const useGetProperties = (
  propertyIDs: string[],
): UseQueryResult<Property, Error>[] => {
  return useQueries({
    queries: propertyIDs.map((propertyID) => {
      return {
        queryKey: [...propertiesKey, propertyID],
        queryFn: () => apiGetProperty(propertyID),
      };
    }),
  });
};

export const useGetProperty = (propertyID: string) => {
  return useQuery({
    queryKey: [...propertiesKey, propertyID],
    queryFn: () => apiGetProperty(propertyID),
  });
};
