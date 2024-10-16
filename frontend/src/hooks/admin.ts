import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  apiAdminCreateUserStatus,
  apiAdminGetAccountStatus,
  apiAdminGetUsersDetails,
  apiAdminGetUsersRoles,
  apiAdminUpdateUserRole,
  apiAdminUpdateUserStatus,
} from "../api/admin";
import { UserDetails } from "../types/Types";
import {
  adminUserDetailsKey,
  adminUserRolesKey,
  adminUserStatusesKey,
} from "../reactQueryKeys";

export const useAdminGetUserDetails = (
  limit: number,
  page: number,
  name: string,
): UseQueryResult<UserDetails[], Error> => {
  return useQuery({
    queryKey: [...adminUserDetailsKey, limit, page, name],
    queryFn: () => apiAdminGetUsersDetails(limit, page, name),
  });
};

export const useAdminGetUserRoles = (userIDs: string[]) => {
  return useQuery({
    queryKey: [...adminUserRolesKey, ...userIDs],
    queryFn: () => apiAdminGetUsersRoles(userIDs),
    enabled: userIDs.length > 0,
  });
};

export const useAdminUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userID, role }: { userID: string; role: string }) =>
      apiAdminUpdateUserRole(userID, role),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [...adminUserRolesKey],
      });
    },
  });
};

export const useAdminGetUserStatuses = (userIDs: string[]) => {
  return useQueries({
    queries: userIDs.map((userId) => ({
      queryKey: [...adminUserStatusesKey, userId],
      queryFn: () => apiAdminGetAccountStatus(userId),
    })),
  });
};

export const useAdminCreateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
      comment,
    }: {
      userId: string;
      status: string;
      comment: string;
    }) => apiAdminCreateUserStatus(userId, status, comment),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: adminUserStatusesKey,
      });
    },
  });
};

export const useAdminUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
      comment,
    }: {
      userId: string;
      status: string;
      comment: string;
    }) => apiAdminUpdateUserStatus(userId, status, comment),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: adminUserStatusesKey,
      });
    },
  });
};
