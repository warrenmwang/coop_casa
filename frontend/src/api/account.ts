import {
  apiAccountLink,
  apiAccountUpdateLink,
  apiAuthLogoutLink,
  apiAuthCheckLink,
  apiUserRoleLink,
  apiAccountUserProfileImagesLink,
  apiAccountStatusLink,
} from "../urls";
import { User, APIUserReceived, APIReceivedUserStatus } from "../types/Types";
import axios, { AxiosResponse } from "axios";
import { DeleteUserResponse, LogoutUserResponse } from "../types/Responses";
import { apiFile2ClientFile } from "../utils/utils";
import {
  APIReceivedCommunityIDsSchema,
  APIReceivedPropertyIDsSchema,
  APIReceivedUserIDsSchema,
  APIReceivedUserStatusSchema,
  UserDetailsSchema,
} from "../types/Schema";

import { APIReceivedUserProfileImages } from "../types/Types";
import { z, ZodError } from "zod";

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

  // User details
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
  return (
    axios
      .get(apiAccountUserProfileImagesLink, {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      })
      .then((res) => res.data)
      // no validation here bc images can be too large when encoded as strings and make zod hang
      // need backend service to be correct.
      .then((data) => data as APIReceivedUserProfileImages)
      .then((data) => data.images)
      .then((images) => {
        // convert images to binary
        let imagesTmp: File[] = [];
        if (images !== null) {
          imagesTmp = images.map((image) =>
            apiFile2ClientFile(image),
          ) as File[];
        }
        return imagesTmp;
      })
  );
};

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
    .then((data) => ({
      userDetails: UserDetailsSchema.parse(data.userDetails),
      avatarImageB64: data.avatarImageB64, // zod cannot parse images encoded as b64 strings
    }))
    .then((data) => data as APIUserReceived)
    .catch((err) => {
      if (err instanceof ZodError) {
        throw new Error(
          "Validation error: user details not of expected schema.",
        );
      }
      throw err;
    });
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
    .then((data) => {
      const res = z.object({ role: z.string().min(1) }).safeParse(data);
      if (res.success) return res.data.role;
      throw new Error(
        "Validation failed: received user role does not match expected schema",
      );
    });
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
    .then((data) => {
      const res = APIReceivedPropertyIDsSchema.safeParse(data);
      if (res.success) return res.data.propertyIDs;
      throw new Error(
        "Validation failed: received user owned properties does not match expected schema",
      );
    });
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
    .then((data) => {
      const res = APIReceivedCommunityIDsSchema.safeParse(data);
      if (res.success) return res.data.communityIDs;
      throw new Error(
        "Validation failed: received user owned communities does not match expected schema",
      );
    });
};

// saved/liked entities

// users
export const apiAccountGetUserLikedUsers = async () => {
  return axios
    .get(`${apiAccountLink}/saved/users`, {
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedUserIDsSchema.safeParse(data);
      if (res.success) return res.data.userIDs;
      throw new Error(
        "Validation failed: received account's liked users does not match expected schema",
      );
    });
};

export const apiAccountLikeUser = async (userID: string) => {
  const formData = new FormData();
  formData.set("userID", userID);
  return axios.post(`${apiAccountLink}/saved/users`, formData, {
    withCredentials: true,
  });
};

export const apiAccountUnlikeUser = async (userID: string) => {
  return axios.delete(`${apiAccountLink}/saved/users/${userID}`, {
    withCredentials: true,
  });
};

// properties
export const apiAccountGetUserLikedProperties = async () => {
  return axios
    .get(`${apiAccountLink}/saved/properties`, {
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedPropertyIDsSchema.safeParse(data);
      if (res.success) return res.data.propertyIDs;
      throw new Error(
        "Validation failed: received property ids does not match expected schema",
      );
    });
};

export const apiAccountLikeProperty = async (propertyID: string) => {
  const formData = new FormData();
  formData.set("propertyID", propertyID);
  return axios.post(`${apiAccountLink}/saved/properties`, formData, {
    withCredentials: true,
  });
};

export const apiAccountUnlikeProperty = async (propertyID: string) => {
  return axios.delete(`${apiAccountLink}/saved/properties/${propertyID}`, {
    withCredentials: true,
  });
};

// communities
export const apiAccountGetUserLikedCommunities = async () => {
  return axios
    .get(`${apiAccountLink}/saved/communities`, {
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedCommunityIDsSchema.safeParse(data);
      if (res.success) return res.data.communityIDs;
      throw new Error(
        "Validation failed: received user owned communities does not match expected schema",
      );
    });
};

export const apiAccountLikeCommunity = async (communityID: string) => {
  const formData = new FormData();
  formData.set("communityID", communityID);
  return axios.post(`${apiAccountLink}/saved/communities`, formData, {
    withCredentials: true,
  });
};

export const apiAccountUnlikeCommunity = async (communityID: string) => {
  return axios.delete(`${apiAccountLink}/saved/communities/${communityID}`, {
    withCredentials: true,
  });
};

export const apiAccountUpdateStatus = async (
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

  return axios.put(`${apiAccountStatusLink}/${userID}`, formData, {
    withCredentials: true,
  });
};

export const apiAccountGetStatus = async (
  userID: string,
): Promise<APIReceivedUserStatus> => {
  return axios
    .get(`${apiAccountStatusLink}/${userID}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    })
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedUserStatusSchema.safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received user status does not match expected schema",
      );
    });
};
