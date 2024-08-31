import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { MAX_NUMBER_USER_PROFILES_PER_PAGE } from "../constants";
import { apiGetUserProfile, apiGetUserProfiles } from "../api/user";
import { UserProfile } from "../types/Types";

export const useGetPageOfUserProfiles = (
  currentPage: number,
  firstName: string,
  lastName: string,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ["userProfilesPage", currentPage, firstName, lastName],
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
        queryKey: ["userProfile", userID],
        queryFn: () => apiGetUserProfile(userID),
      };
    }),
  });
};

export const useGetUserProfile = (
  userID: string,
): UseQueryResult<UserProfile, Error> => {
  return useQuery({
    queryKey: ["userProfile", userID],
    queryFn: () => apiGetUserProfile(userID),
  });
};
