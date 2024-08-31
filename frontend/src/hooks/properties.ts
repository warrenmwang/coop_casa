import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiGetProperties, apiGetProperty } from "../api/property";
import { Property } from "../types/Types";

export const useGetPageOfPropertyIDs = (
  currentPage: number,
  filterAddress: string,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ["propertiesPage", currentPage, filterAddress],
    queryFn: () => apiGetProperties(currentPage, filterAddress),
  });
};

export const useGetPropertiesInfo = (
  propertyIDs: string[],
): UseQueryResult<Property, Error>[] => {
  return useQueries({
    queries: propertyIDs.map((propertyID) => {
      return {
        queryKey: ["properties", propertyID],
        queryFn: () => apiGetProperty(propertyID),
      };
    }),
  });
};

export const useGetProperty = (propertyID: string) => {
  return useQuery({
    queryKey: ["properties", propertyID],
    queryFn: () => apiGetProperty(propertyID),
  });
};
