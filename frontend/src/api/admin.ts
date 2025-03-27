import {
  APIReceivedUserDetailsSchema,
  APIReceivedUserRolesSchema,
  UserStatusSchemaTimeStamped,
} from "@app/types/Schema";
import { UserDetails, UserStatusTimeStamped } from "@app/types/Types";
import {
  apiAdminTotalsLink,
  apiAdminUsersLink,
  apiAdminUsersRolesLink,
} from "@app/urls";
import { z } from "zod";

export async function apiAdminGetUsersDetails(
  limit: number,
  page: number,
  name: string,
): Promise<UserDetails[]> {
  return fetch(
    `${apiAdminUsersLink}?limit=${limit}&offset=${page * limit}&name=${name}`,
    {
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    },
  )
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedUserDetailsSchema.safeParse(data);
      if (res.success) return res.data.userDetails;
      throw new Error(
        "Validation failed: received users details does not match expected schema",
      );
    });
}

export async function apiAdminGetUsersRoles(
  userIDs: string[],
): Promise<string[]> {
  // if empty input, just resolve with nothing and save on network request
  if (userIDs.length === 0) {
    return Promise.resolve([]);
  }

  return fetch(`${apiAdminUsersRolesLink}?userIds=${userIDs}`, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedUserRolesSchema.safeParse(data);
      if (res.success) return res.data.userRoles.map((v) => v.role);
      throw new Error(
        "Validation failed: received users roles does not match expected schema",
      );
    });
}

export async function apiAdminUpdateUserRole(
  userID: string,
  role: string,
  propertyTransfer?: boolean,
  transferUserID?: string,
): Promise<Response> {
  return fetch(
    `${apiAdminUsersRolesLink}?userID=${userID}&role=${role}&propertyTransfer=${propertyTransfer}&transferUserID=${transferUserID}`,
    {
      method: "POST",
      credentials: "include",
    },
  );
}

export async function apiAdminGetAccountStatus(
  userID: string,
): Promise<UserStatusTimeStamped> {
  return fetch(`${apiAdminUsersLink}/status/${userID}`, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = UserStatusSchemaTimeStamped.safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received user status does not match expected schema",
      );
    });
}

export async function apiAdminCreateUserStatus(
  userId: string,
  status: string,
  comment: string,
): Promise<Response> {
  return fetch(`${apiAdminUsersLink}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      userId,
      status,
      comment,
    }),
  });
}

export async function apiAdminUpdateUserStatus(
  userId: string,
  status: string,
  comment: string,
): Promise<Response> {
  return fetch(`${apiAdminUsersLink}/status/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      userId,
      status,
      comment,
    }),
  });
}

export async function apiAdminGetTotalCountProperties(): Promise<number> {
  return fetch(`${apiAdminTotalsLink}/properties`, {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const res = z.number().safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received total count properties does not match expected schema",
      );
    });
}

export async function apiAdminGetTotalCountCommunities(): Promise<number> {
  return fetch(`${apiAdminTotalsLink}/communities`, {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const res = z.number().safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received total count communities does not match expected schema",
      );
    });
}

export async function apiAdminGetTotalCountUsers(): Promise<number> {
  return fetch(`${apiAdminTotalsLink}/users`, {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const res = z.number().safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received total count users does not match expected schema",
      );
    });
}
