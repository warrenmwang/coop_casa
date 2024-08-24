import {
  apiAccountLink,
  apiAccountUpdateLink,
  apiAuthLogoutLink,
  apiAuthCheckLink,
  apiUserRoleLink,
} from "../urls";
import { User, APIUserReceived } from "../types/Types";
import axios from "axios";

// Delete Account Function
export const apiAccountDelete = async (): Promise<any> => {
  return axios.delete(apiAccountLink, {
    withCredentials: true,
  });
};

// Update Account Details
export const apiUpdateUserAccountDetails = async (
  newUserData: User,
): Promise<Response> => {
  const formData = new FormData();

  // User details (string values)
  formData.append(
    "user",
    JSON.stringify({
      userId: newUserData.userId,
      email: newUserData.email,
      firstName: newUserData.firstName,
      lastName: newUserData.lastName,
      birthDate: newUserData.birthDate,
      gender: newUserData.gender,
      location: newUserData.location,
      interests: newUserData.interests,
    }),
  );

  // Avatar image if given
  if (newUserData.avatar) {
    formData.append("avatar", newUserData.avatar);
  }

  return axios.post(apiAccountUpdateLink, formData, {
    withCredentials: true,
  });
};

// Log out user from system, end session by invalidating the client side token
export const apiLogoutUser = async (): Promise<any> => {
  return axios.post(
    apiAuthLogoutLink,
    {},
    {
      withCredentials: true,
    },
  );
};

export const apiGetUserAuth = async (): Promise<boolean> => {
  return axios
    .get(apiAuthCheckLink, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => data.accountIsAuthed as boolean);
};

export const apiGetUser = async (): Promise<APIUserReceived> => {
  return axios
    .get(apiAccountLink, {
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => data as APIUserReceived);
};

export const apiGetUserRole = async (): Promise<string> => {
  return axios
    .get(apiUserRoleLink, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => data.role as string);
};