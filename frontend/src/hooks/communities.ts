import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  apiCreateCommunity,
  apiDeleteCommunity,
  apiGetCommunities,
  apiGetCommunity,
  apiUpdateCommunity,
} from "../api/community";
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

export const useCreateCommunity = () => {
  return useMutation({
    mutationFn: ({ community }: { community: Community }) =>
      apiCreateCommunity(community),
  });
};

export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ community }: { community: Community }) =>
      apiUpdateCommunity(community).then(() => community.details.communityId),
    onSuccess: (communityID: string) => {
      return queryClient.invalidateQueries({
        queryKey: [...communitiesKey, communityID],
      });
    },
  });
};

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityID }: { communityID: string }) =>
      apiDeleteCommunity(communityID).then(() => communityID),
    onSuccess: (communityID: string) => {
      return queryClient.invalidateQueries({
        queryKey: [...communitiesKey, communityID],
      });
    },
  });
};
