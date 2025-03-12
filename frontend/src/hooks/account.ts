import {
  apiAccountDelete,
  apiAccountGetStatus,
  apiAccountGetUserLikedCommunities,
  apiAccountGetUserLikedProperties,
  apiAccountGetUserLikedUsers,
  apiAccountGetUserProfileImages,
  apiAccountLikeCommunity,
  apiAccountLikeProperty,
  apiAccountLikeUser,
  apiAccountUnlikeCommunity,
  apiAccountUnlikeProperty,
  apiAccountUnlikeUser,
  apiAccountUpdateStatus,
  apiGetUser,
  apiGetUserAuth,
  apiGetUserOwnedCommunities,
  apiGetUserRole,
  apiLogoutUser,
  apiUpdateUserAccountDetailsAndProfileImages,
} from "@app/api/account";
import { apiGetUserOwnedProperties } from "@app/api/account";
import {
  userAccountKey,
  userAuthKey,
  userCommunitiesKey,
  userDetailsKey,
  userImagesKey,
  userKey,
  userLikedCommunitiesKey,
  userLikedPropertiesKey,
  userLikedUsersKey,
  userPropertiesKey,
  userRoleKey,
  userStatusKey,
} from "@app/reactQueryKeys";
import { APIUserReceived, User } from "@app/types/Types";
import {
  UseQueryResult,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useGetUserAccountDetails = (): UseQueryResult<
  APIUserReceived,
  Error
> => {
  return useQuery({
    queryKey: userDetailsKey,
    queryFn: apiGetUser,
  });
};

export const useGetUserAccountAuth = (): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: userAuthKey,
    queryFn: apiGetUserAuth,
  });
};

export const useGetUserAccountRole = (): UseQueryResult<string, Error> => {
  return useQuery({
    queryKey: userRoleKey,
    queryFn: apiGetUserRole,
  });
};

export const useGetAccountUserProfileImages = (): UseQueryResult<
  File[],
  Error
> => {
  return useQuery({
    queryKey: userImagesKey,
    queryFn: apiAccountGetUserProfileImages,
  });
};

export const useGetUserOwnedPropertiesIDs = () => {
  return useQuery({
    queryKey: userPropertiesKey,
    queryFn: apiGetUserOwnedProperties,
  });
};

export const useGetUserOwnedCommunitiesIDs = () => {
  return useQuery({
    queryKey: userCommunitiesKey,
    queryFn: apiGetUserOwnedCommunities,
  });
};

export const useLogoutUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogoutUser,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userAccountKey,
      });
    },
  });
};

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, images }: { formData: User; images: File[] }) =>
      apiUpdateUserAccountDetailsAndProfileImages(formData, images),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userAccountKey,
      });
    },
  });
};

export const useDeleteUserAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiAccountDelete,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userKey,
      });
    },
  });
};

export const useGetLikedUsers = () => {
  return useQuery({
    queryKey: userLikedUsersKey,
    queryFn: apiAccountGetUserLikedUsers,
  });
};

export const useLikeUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userID }: { userID: string }) => apiAccountLikeUser(userID),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userLikedUsersKey,
      });
    },
  });
};

export const useUnlikeUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userID }: { userID: string }) =>
      apiAccountUnlikeUser(userID),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userLikedUsersKey,
      });
    },
  });
};

export const useGetLikedProperties = () => {
  return useQuery({
    queryKey: userLikedPropertiesKey,
    queryFn: apiAccountGetUserLikedProperties,
  });
};

export const useLikeProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyID }: { propertyID: string }) =>
      apiAccountLikeProperty(propertyID),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userLikedPropertiesKey,
      });
    },
  });
};

export const useUnlikeProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyID }: { propertyID: string }) =>
      apiAccountUnlikeProperty(propertyID),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userLikedPropertiesKey,
      });
    },
  });
};

export const useGetLikedCommunities = () => {
  return useQuery({
    queryKey: userLikedCommunitiesKey,
    queryFn: apiAccountGetUserLikedCommunities,
  });
};

export const useLikeCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityID }: { communityID: string }) =>
      apiAccountLikeCommunity(communityID),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userLikedCommunitiesKey,
      });
    },
  });
};

export const useUnlikeCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityID }: { communityID: string }) =>
      apiAccountUnlikeCommunity(communityID),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userLikedCommunitiesKey,
      });
    },
  });
};

export const useGetLikedEntities = () => {
  return useQueries({
    queries: [
      {
        queryKey: userLikedUsersKey,
        queryFn: apiAccountGetUserLikedUsers,
      },
      {
        queryKey: userLikedPropertiesKey,
        queryFn: apiAccountGetUserLikedProperties,
      },
      {
        queryKey: userLikedCommunitiesKey,
        queryFn: apiAccountGetUserLikedCommunities,
      },
    ],
  });
};

export const useGetAccountStatus = () => {
  return useQuery({
    queryKey: userStatusKey,
    queryFn: () => apiAccountGetStatus(),
  });
};

export const useUpdateAccountStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status }: { status: string }) =>
      apiAccountUpdateStatus(status),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userStatusKey,
      });
    },
  });
};
