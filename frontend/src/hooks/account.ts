import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  apiAccountGetUserProfileImages,
  apiGetUser,
  apiGetUserAuth,
  apiGetUserOwnedCommunities,
  apiGetUserRole,
} from "../api/account";
import { APIUserReceived } from "../types/Types";
import {
  userImagesKey,
  userAuthKey,
  userRoleKey,
  userDetailsKey,
  userPropertiesKey,
  userCommunitiesKey,
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
