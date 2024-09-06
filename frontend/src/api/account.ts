import {
  apiAccountLink,
  apiAccountUpdateLink,
  apiAuthLogoutLink,
  apiAuthCheckLink,
  apiUserRoleLink,
  apiAccountUserProfileImagesLink,
} from "../urls";
import { User, APIUserReceived, APIFileReceived } from "../types/Types";
import axios, { AxiosResponse } from "axios";
import { DeleteUserResponse, LogoutUserResponse } from "../types/Responses";
import { apiFile2ClientFile } from "../utils/utils";

// Delete Account Function
export const apiAccountDelete = async (): Promise<
  AxiosResponse<DeleteUserResponse>
> => {
  return axios.delete<DeleteUserResponse>(apiAccountLink, {
    withCredentials: true,
  });
};

// Update Account Details
export const apiUpdateUserAccountDetails = async (newUserData: User) => {
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

export const apiUpdateUserProfileImages = async (images: File[]) => {
  const formData = new FormData();

  const numImages: number = images.length;

  formData.append("numImages", `${numImages}`);
  for (let i = 0; i < numImages; i++) {
    formData.append(`image${i}`, images[i]);
  }

  return axios.post(apiAccountUserProfileImagesLink, formData, {
    withCredentials: true,
  });
};

export const apiUpdateUserAccountDetailsAndProfileImages = async (
  newUserData: User,
  images: File[],
) => {
  const updateDetailsPromise = apiUpdateUserAccountDetails(newUserData);
  const updateImagesPromise = apiUpdateUserProfileImages(images);
  return Promise.all([updateDetailsPromise, updateImagesPromise]);
};

export const apiAccountGetUserProfileImages = async (): Promise<File[]> => {
  return axios
    .get(apiAccountUserProfileImagesLink, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => data.images as APIFileReceived[])
    .then((images) => {
      // convert images to binary
      let imagesTmp: File[] = [];
      if (images !== null) {
        imagesTmp = images.map((image) => apiFile2ClientFile(image)) as File[];
      }
      return imagesTmp;
    });
};

// export const apiAccountGetUserDetailsAndProfileImages = async (): Promise<
//   [APIUserReceived, File[]]
// > => {
//   const userDetailsPromise = apiGetUser();
//   const userImagesPromise = apiAccountGetUserProfileImages();
//   return Promise.all([userDetailsPromise, userImagesPromise]);
// };

// Log out user from system, end session by invalidating the client side token
export const apiLogoutUser = async (): Promise<
  AxiosResponse<LogoutUserResponse>
> => {
  return axios.post<LogoutUserResponse>(
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
    .then((data) => data.authed as boolean)
    .catch(() => false);
};

// Function from before user profile images
// Returns user details and avatar image
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

export const apiGetUserOwnedProperties = async (): Promise<string[]> => {
  return axios
    .get(`${apiAccountLink}/properties`, {
      headers: {
        Accept: "application/json,",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => data.propertyIDs as string[]);
};

export const apiGetUserOwnedCommunities = async (): Promise<string[]> => {
  return axios
    .get(`${apiAccountLink}/communities`, {
      headers: {
        Accept: "application/json,",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => data.communityIDs as string[]);
};
