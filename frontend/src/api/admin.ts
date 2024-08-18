import { apiAdminUsersLink, apiAdminUsersRolesLink } from "../urls";
import { UserDetails } from "../types/Types";
import axios from "axios";

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
    .then((res) => res.data);
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
    .then((resp) => resp.data)
    .catch((err) => console.error(err));
};
