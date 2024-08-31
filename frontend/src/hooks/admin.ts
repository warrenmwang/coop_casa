import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiAdminGetUsersDetails, apiAdminGetUsersRoles } from "../api/admin";
import { UserDetails } from "../types/Types";

export const useAdminGetUserDetails = (
  limit: number,
  page: number,
): UseQueryResult<UserDetails[], Error> => {
  return useQuery({
    queryKey: ["admin", "user", "details", limit, page],
    queryFn: () => apiAdminGetUsersDetails(limit, page),
  });
};

export const useAdminGetUserRoles = (userIDs: string[]) => {
  return useQuery({
    queryKey: ["admin", "user", "roles", userIDs],
    queryFn: () => apiAdminGetUsersRoles(userIDs),
    enabled: userIDs.length > 0,
  });
};
