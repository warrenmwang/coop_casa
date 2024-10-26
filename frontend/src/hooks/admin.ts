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
  apiAdminGetTotalCountCommunities,
  apiAdminGetTotalCountProperties,
  apiAdminGetTotalCountUsers,
  apiAdminGetUsersDetails,
  apiAdminGetUsersRoles,
  apiAdminUpdateUserRole,
  apiAdminUpdateUserStatus,
} from "@app/api/admin";
import { UserDetails } from "@app/types/Types";
import {
  adminTotalsKey,
  adminUserDetailsKey,
  adminUserRolesKey,
  adminUserStatusesKey,
} from "@app/reactQueryKeys";

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
    mutationFn: ({
      userID,
      role,
      propertyTransfer,
      transferUserID,
    }: {
      userID: string;
      role: string;
      propertyTransfer?: boolean | undefined;
      transferUserID?: string | undefined;
    }) =>
      apiAdminUpdateUserRole(userID, role, propertyTransfer, transferUserID),
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

export const useAdminGetTotalNumberProperties = () => {
  return useQuery({
    queryKey: [...adminTotalsKey, "properties"],
    queryFn: apiAdminGetTotalCountProperties,
  });
};

export const useAdminGetTotalNumberCommunities = () => {
  return useQuery({
    queryKey: [...adminTotalsKey, "communities"],
    queryFn: apiAdminGetTotalCountCommunities,
  });
};

export const useAdminGetTotalNumberUsers = () => {
  return useQuery({
    queryKey: [...adminTotalsKey, "users"],
    queryFn: apiAdminGetTotalCountUsers,
  });
};
