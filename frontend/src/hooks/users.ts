import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { MAX_NUMBER_USER_PROFILES_PER_PAGE } from "appConstants";
import {
  apiGetUserProfile,
  apiGetUserProfileImages,
  apiGetUserProfiles,
} from "../api/user";
import { UserProfile } from "../types/Types";
import {
  publicUserProfileImagesKey,
  publicUserProfileKey,
  publicUserProfilesPageKey,
} from "../reactQueryKeys";

export const useGetPageOfUserProfiles = (
  currentPage: number,
  firstName: string,
  lastName: string,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: [...publicUserProfilesPageKey, currentPage, firstName, lastName],
    queryFn: () =>
      apiGetUserProfiles(
        currentPage,
        MAX_NUMBER_USER_PROFILES_PER_PAGE,
        firstName,
        lastName,
      ),
  });
};

export const useGetUserProfiles = (
  userIDs: string[],
): UseQueryResult<UserProfile, Error>[] => {
  return useQueries({
    queries: userIDs.map((userID) => {
      return {
        queryKey: [...publicUserProfileKey, userID],
        queryFn: () => apiGetUserProfile(userID),
      };
    }),
  });
};

export const useGetUserProfile = (
  userID: string,
): UseQueryResult<UserProfile, Error> => {
  return useQuery({
    queryKey: [...publicUserProfileKey, userID],
    queryFn: () => apiGetUserProfile(userID),
  });
};

export const useGetUserProfileImages = (
  userID: string,
): UseQueryResult<File[], Error> => {
  return useQuery({
    queryKey: [...publicUserProfileImagesKey, userID],
    queryFn: () => apiGetUserProfileImages(userID),
  });
};
