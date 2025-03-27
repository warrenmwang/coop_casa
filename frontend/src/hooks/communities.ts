import {
  apiCreateCommunity,
  apiDeleteCommunity,
  apiGetCommunities,
  apiGetCommunity,
  apiTransferCommunity,
  apiUpdateCommunity,
} from "@app/api/community";
import {
  communitiesKey,
  communitiesPageKey,
  userCommunitiesKey,
} from "@app/reactQueryKeys";
import { Community } from "@app/types/Types";
import {
  UseQueryResult,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
  enabled?: boolean,
): UseQueryResult<Community, Error> => {
  return useQuery({
    queryKey: [...communitiesKey, communityID],
    queryFn: () => apiGetCommunity(communityID),
    enabled: typeof enabled === "undefined" ? true : enabled,
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
      queryClient.invalidateQueries({
        queryKey: [...communitiesKey, communityID],
      });
      queryClient.invalidateQueries({
        queryKey: [...userCommunitiesKey],
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
      queryClient.invalidateQueries({
        queryKey: [...communitiesKey, communityID],
      });
      queryClient.invalidateQueries({
        queryKey: [...userCommunitiesKey],
      });
    },
  });
};

export const useTransferCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      communityID,
      userID,
    }: {
      communityID: string;
      userID: string;
    }) => apiTransferCommunity(communityID, userID),
    onSuccess: (communityID) => {
      queryClient.invalidateQueries({
        queryKey: [...communitiesKey, communityID],
      });
      queryClient.invalidateQueries({
        queryKey: [...userCommunitiesKey],
      });
    },
  });
};
