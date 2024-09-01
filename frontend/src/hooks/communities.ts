import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiGetCommunities, apiGetCommunity } from "../api/community";
import { Community } from "../types/Types";
import { communitiesKey, communitiesPageKey } from "../reactQueryKeys";

export const useGetPageOfCommunityIDs = (
  currentPage: number,
  name: string,
  description: string,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: [...communitiesPageKey, currentPage, name, description],
    queryFn: () => apiGetCommunities(currentPage, name, description),
  });
};

export const useGetCommunities = (
  communityIDs: string[],
): UseQueryResult<Community, Error>[] => {
  return useQueries({
    queries: communityIDs.map((communityID) => {
      return {
        queryKey: [...communitiesKey, communityID],
        queryFn: () => apiGetCommunity(communityID),
      };
    }),
  });
};

export const useGetCommunity = (
  communityID: string,
): UseQueryResult<Community, Error> => {
  return useQuery({
    queryKey: [...communitiesKey, communityID],
    queryFn: () => apiGetCommunity(communityID),
  });
};
