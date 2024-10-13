import { apiAccountStatusLink, apiAdminUsersLink, apiAdminUsersRolesLink } from "urls";
import { UserDetails } from "../types/Types";
import axios, { AxiosResponse } from "axios";
import { AdminUpdateUserRoleResponse } from "../types/Responses";
import {
  APIReceivedUserDetailsSchema,
  APIReceivedUserRolesSchema,
} from "../types/Schema";

export const apiAdminGetUsersDetails = async (
  limit: number,
  page: number,
): Promise<UserDetails[]> => {
  return axios
    .get(`${apiAdminUsersLink}?limit=${limit}&offset=${page * limit}`, {
      headers: {
        Accept: "application/json",
      },

      withCredentials: true,
    })
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

export const apiAdminCreateUserStatus = async (
  userID: string,
  setterUserID: string,
  status: string,
  comment: string = "",
) => {
  const formData = new FormData();
  formData.set(
    "data",
    JSON.stringify({
      userId: userID,
      setterUserId: setterUserID,
      status: status,
      comment: comment,
    }),
  );

  return axios.post(apiAccountStatusLink, formData, {
    withCredentials: true,
  });
};
