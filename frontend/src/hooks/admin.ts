import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiAdminGetUsersDetails, apiAdminGetUsersRoles } from "../api/admin";
import { UserDetails } from "../types/Types";
import { adminUserDetailsKey, adminUserRolesKey } from "../reactQueryKeys";

export const useAdminGetUserDetails = (
  limit: number,
  page: number,
): UseQueryResult<UserDetails[], Error> => {
  return useQuery({
    queryKey: [...adminUserDetailsKey, limit, page],
    queryFn: () => apiAdminGetUsersDetails(limit, page),
  });
};

export const useAdminGetUserRoles = (userIDs: string[]) => {
  return useQuery({
    queryKey: [...adminUserRolesKey, userIDs],
    queryFn: () => apiAdminGetUsersRoles(userIDs),
    enabled: userIDs.length > 0,
  });
};
