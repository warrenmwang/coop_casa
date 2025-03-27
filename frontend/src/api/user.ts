import {
  FILTER_FIRST_NAME_QP_KEY,
  FILTER_LAST_NAME_QP_KEY,
  LIMIT_QP_KEY,
  PAGE_QP_KEY,
} from "@app/appConstants";
import {
  APIReceivedUserIDsSchema,
  APIReceivedUserProfileImagesSchema,
  APIUserProfileReceivedSchema,
} from "@app/types/Schema";
import { APIFileReceived, UserProfile } from "@app/types/Types";
import { apiUsersLink } from "@app/urls";
import { apiFile2ClientFile } from "@app/utils/utils";

export async function apiGetUserProfiles(
  page: number,
  limit: number,
  filterFirstName: string,
  filterLastName: string,
): Promise<string[]> {
  return fetch(
    `${apiUsersLink}?${PAGE_QP_KEY}=${page}&${LIMIT_QP_KEY}=${limit}&${FILTER_FIRST_NAME_QP_KEY}=${filterFirstName}&${FILTER_LAST_NAME_QP_KEY}=${filterLastName}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedUserIDsSchema.safeParse(data);
      if (res.success) return res.data.userIDs;
      throw new Error(
        "Validation failed: received user ids does not match expected schema",
      );
    });
}

export async function apiGetUserProfile(userID: string): Promise<UserProfile> {
  return fetch(`${apiUsersLink}/${userID}`, {
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // NOTE: not parsing the images array because it can contain
      // very large b64 strings (encoded binary image data of up to 5Mib)
      // which translated to b64 string can be up to ~6.5 MiB, which apparently
      // is too much for zod, because it will hang!
      // This is a "good enough" check. We are expecting
      // correct data from the backend service anyway, parsing and runtime type
      // checking is an extra step of being careful.
      const APIUserProfileWithoutImageSchema =
        APIUserProfileReceivedSchema.omit({ images: true });
      const res = APIUserProfileWithoutImageSchema.safeParse(data);
      if (res.success)
        return { ...res.data, images: data.images as APIFileReceived[] };
      throw new Error(
        "Validation failed: received user profile does not match expected schema",
      );
    })
    .then((data) => {
      // Transform apifiles to File
      return {
        details: data.details,
        images: data.images.map((image) => apiFile2ClientFile(image)) as File[],
        communityIDs: data.communityIDs,
        propertyIDs: data.propertyIDs,
      } as UserProfile;
    });
}

export async function apiGetUserProfileImages(userID: string): Promise<File[]> {
  return fetch(`${apiUsersLink}/${userID}/images`, {
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedUserProfileImagesSchema.safeParse(data);
      if (res.success) return res.data.images;
      throw new Error(
        "Validation failed: received account's liked users does not match expected schema",
      );
    })
    .then((images) => {
      // convert images to binary
      return images.map((image) => apiFile2ClientFile(image)) as File[];
    });
}
