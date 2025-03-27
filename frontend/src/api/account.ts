import {
  APIReceivedCommunityIDsSchema,
  APIReceivedPropertyIDsSchema,
  APIReceivedUserIDsSchema,
  UserDetailsSchema,
  UserStatusSchemaTimeStamped,
} from "@app/types/Schema";
import { APIUserReceived, User, UserStatusTimeStamped } from "@app/types/Types";
import { APIReceivedUserProfileImages } from "@app/types/Types";
import {
  apiAccountLink,
  apiAccountStatusLink,
  apiAccountUpdateLink,
  apiAccountUserProfileImagesLink,
  apiAuthCheckLink,
  apiAuthLogoutLink,
  apiUserRoleLink,
} from "@app/urls";
import { apiFile2ClientFile } from "@app/utils/utils";
import { ZodError, z } from "zod";

// Delete Account Function
export async function apiAccountDelete(): Promise<Response> {
  return fetch(apiAccountLink, {
    method: "DELETE",
    credentials: "include",
  }).then((res) => res);
}

// Update Account Details
export async function apiUpdateUserAccountDetails(newUserData: User) {
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

  return fetch(apiAccountUpdateLink, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiUpdateUserProfileImages(images: File[]) {
  const formData = new FormData();

  const numImages: number = images.length;

  formData.append("numImages", `${numImages}`);
  for (let i = 0; i < numImages; i++) {
    formData.append(`image${i}`, images[i]);
  }

  return fetch(apiAccountUserProfileImagesLink, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiUpdateUserAccountDetailsAndProfileImages(
  newUserData: User,
  images: File[],
) {
  const updateDetailsPromise = apiUpdateUserAccountDetails(newUserData);
  const updateImagesPromise = apiUpdateUserProfileImages(images);
  return Promise.all([updateDetailsPromise, updateImagesPromise]);
}

export async function apiAccountGetUserProfileImages(): Promise<File[]> {
  return fetch(apiAccountUserProfileImagesLink, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => data as APIReceivedUserProfileImages)
    .then((data) => data.images)
    .then((images) => {
      // convert images to binary
      let imagesTmp: File[] = [];
      if (images !== null) {
        imagesTmp = images.map((image) => apiFile2ClientFile(image)) as File[];
      }
      return imagesTmp;
    });
}

// Log out user from system, end session by invalidating the client side token
export async function apiLogoutUser(): Promise<Response> {
  return fetch(apiAuthLogoutLink, {
    method: "POST",
    credentials: "include",
  });
}

export async function apiGetUserAuth(): Promise<boolean> {
  return fetch(apiAuthCheckLink, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => data.authed as boolean)
    .catch(() => false);
}

// Function from before user profile images
// Returns user details and avatar image
export async function apiGetUser(): Promise<APIUserReceived> {
  return fetch(apiAccountLink, {
    credentials: "include",
  })
    .then((res) => res.json())
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
}

export async function apiGetUserRole(): Promise<string> {
  return fetch(apiUserRoleLink, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = z.object({ role: z.string().min(1) }).safeParse(data);
      if (res.success) return res.data.role;
      throw new Error(
        "Validation failed: received user role does not match expected schema",
      );
    });
}

export async function apiGetUserOwnedProperties(): Promise<string[]> {
  return fetch(`${apiAccountLink}/properties`, {
    headers: {
      Accept: "application/json,",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedPropertyIDsSchema.safeParse(data);
      if (res.success) return res.data.propertyIDs;
      throw new Error(
        "Validation failed: received user owned properties does not match expected schema",
      );
    });
}

export async function apiGetUserOwnedCommunities(): Promise<string[]> {
  return fetch(`${apiAccountLink}/communities`, {
    headers: {
      Accept: "application/json,",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedCommunityIDsSchema.safeParse(data);
      if (res.success) return res.data.communityIDs;
      throw new Error(
        "Validation failed: received user owned communities does not match expected schema",
      );
    });
}

// saved/liked entities

// users
export async function apiAccountGetUserLikedUsers() {
  return fetch(`${apiAccountLink}/saved/users`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedUserIDsSchema.safeParse(data);
      if (res.success) return res.data.userIDs;
      throw new Error(
        "Validation failed: received account's liked users does not match expected schema",
      );
    });
}

export async function apiAccountLikeUser(userID: string) {
  const formData = new FormData();
  formData.set("userID", userID);
  return fetch(`${apiAccountLink}/saved/users`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiAccountUnlikeUser(userID: string) {
  return fetch(`${apiAccountLink}/saved/users/${userID}`, {
    method: "DELETE",
    credentials: "include",
  });
}

// properties
export async function apiAccountGetUserLikedProperties() {
  return fetch(`${apiAccountLink}/saved/properties`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedPropertyIDsSchema.safeParse(data);
      if (res.success) return res.data.propertyIDs;
      throw new Error(
        "Validation failed: received property ids does not match expected schema",
      );
    });
}

export async function apiAccountLikeProperty(propertyID: string) {
  const formData = new FormData();
  formData.set("propertyID", propertyID);
  return fetch(`${apiAccountLink}/saved/properties`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiAccountUnlikeProperty(propertyID: string) {
  return fetch(`${apiAccountLink}/saved/properties/${propertyID}`, {
    method: "DELETE",
    credentials: "include",
  });
}

// communities
export async function apiAccountGetUserLikedCommunities() {
  return fetch(`${apiAccountLink}/saved/communities`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedCommunityIDsSchema.safeParse(data);
      if (res.success) return res.data.communityIDs;
      throw new Error(
        "Validation failed: received user owned communities does not match expected schema",
      );
    });
}

export async function apiAccountLikeCommunity(communityID: string) {
  const formData = new FormData();
  formData.set("communityID", communityID);
  return fetch(`${apiAccountLink}/saved/communities`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiAccountUnlikeCommunity(communityID: string) {
  return fetch(`${apiAccountLink}/saved/communities/${communityID}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function apiAccountUpdateStatus(status: string) {
  return fetch(apiAccountStatusLink, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
}

export async function apiAccountGetStatus(): Promise<UserStatusTimeStamped> {
  return fetch(`${apiAccountStatusLink}`, {
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
