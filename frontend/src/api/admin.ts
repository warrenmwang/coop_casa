import { apiAdminUsersLink, apiAdminUsersRolesLink } from "urls";
import { UserDetails, UserStatusTimeStamped } from "../types/Types";
import axios, { AxiosResponse } from "axios";
import { AdminUpdateUserRoleResponse } from "../types/Responses";
import {
  APIReceivedUserDetailsSchema,
  APIReceivedUserRolesSchema,
  UserStatusSchemaTimeStamped,
} from "../types/Schema";

export const apiAdminGetUsersDetails = async (
  limit: number,
  page: number,
  name: string,
): Promise<UserDetails[]> => {
  return axios
    .get(
      `${apiAdminUsersLink}?limit=${limit}&offset=${page * limit}&name=${name}`,
      {
        headers: {
          Accept: "application/json",
        },

        withCredentials: true,
      },
    )
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedUserDetailsSchema.safeParse(data);
      if (res.success) return res.data.userDetails;
      throw new Error(
        "Validation failed: received users details does not match expected schema",
      );
    });
};

export const apiAdminGetUsersRoles = async (
  userIDs: string[],
): Promise<string[]> => {
  // if empty input, just resolve with nothing and save on network request
  if (userIDs.length === 0) {
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  // o.w. actually have some userIDs to query
  return axios
    .get(`${apiAdminUsersRolesLink}?userIds=${userIDs}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedUserRolesSchema.safeParse(data);
      if (res.success) return res.data.userRoles.map((v) => v.role);
      throw new Error(
        "Validation failed: received users roles does not match expected schema",
      );
    });
};

export const apiAdminUpdateUserRole = async (
  userID: string,
  role: string,
): Promise<AxiosResponse<AdminUpdateUserRoleResponse>> => {
  return axios.post<AdminUpdateUserRoleResponse>(
    `${apiAdminUsersRolesLink}?userID=${userID}&role=${role}`,
    {},
    {
      withCredentials: true,
    },
  );
};

export const apiAdminGetAccountStatus = async (
  userID: string,
): Promise<UserStatusTimeStamped> => {
  return axios
    .get(`${apiAdminUsersLink}/status/${userID}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => {
      const res = UserStatusSchemaTimeStamped.safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received user status does not match expected schema",
      );
    });
};

export const apiAdminCreateUserStatus = async (
  userId: string,
  status: string,
  comment: string,
) => {
  return axios.post(
    `${apiAdminUsersLink}/status`,
    JSON.stringify({
      userId,
      status,
      comment,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );
};

export const apiAdminUpdateUserStatus = async (
  userId: string,
  status: string,
  comment: string,
) => {
  return axios.put(
    `${apiAdminUsersLink}/status/${userId}`,
    JSON.stringify({
      userId,
      status,
      comment,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    },
  );
};
