import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  apiAccountGetUserProfileImages,
  apiGetUser,
  apiGetUserAuth,
  apiGetUserRole,
} from "../api/account";
import { APIUserReceived } from "../types/Types";
import {
  userImagesKey,
  userAuthKey,
  userRoleKey,
  userDetailsKey,
} from "../reactQueryKeys";

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
