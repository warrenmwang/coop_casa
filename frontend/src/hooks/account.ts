import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  apiAccountDelete,
  apiAccountGetUserProfileImages,
  apiGetUser,
  apiGetUserAuth,
  apiGetUserOwnedCommunities,
  apiGetUserRole,
  apiLogoutUser,
  apiUpdateUserAccountDetailsAndProfileImages,
} from "../api/account";
import { APIUserReceived, User } from "../types/Types";
import {
  userImagesKey,
  userAuthKey,
  userRoleKey,
  userDetailsKey,
  userPropertiesKey,
  userCommunitiesKey,
  userAccountKey,
  userKey,
} from "../reactQueryKeys";
import { apiGetUserOwnedProperties } from "../api/account";

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
