import axios from "axios";
import { apiUsersLink } from "../urls";
import {
  filterFirstNameQPKey,
  filterLastNameQPKey,
  limitQPKey,
  pageQPKey,
} from "../constants";
import {
  APIFileReceived,
  APIUserProfileReceived,
  UserProfile,
} from "../types/Types";
import { apiFile2ClientFile } from "../utils/utils";

export const apiGetUserProfiles = async (
  page: number,
  limit: number,
  filterFirstName: string,
  filterLastName: string,
): Promise<string[]> => {
  return axios
    .get(
      `${apiUsersLink}?${pageQPKey}=${page}&${limitQPKey}=${limit}&${filterFirstNameQPKey}=${filterFirstName}&${filterLastNameQPKey}=${filterLastName}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )
    .then((res) => res.data)
    .then((data) => {
      return data.userIDs !== null ? (data.userIDs as string[]) : [];
    });
};

export const apiGetUserProfile = async (
  userID: string,
): Promise<UserProfile> => {
  return axios
    .get(`${apiUsersLink}/${userID}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.data)
    .then((data) => data as APIUserProfileReceived)
    .then((data) => {
      // convert images to binary
      let imagesTmp: File[] = [];
      if (data.images !== null) {
        imagesTmp = data.images.map((image) =>
          apiFile2ClientFile(image),
        ) as File[];
      }
      return {
        details: data.details,
        images: imagesTmp,
        communityIDs: data.communityIDs,
        propertyIDs: data.propertyIDs,
      } as UserProfile;
    });
};

export const apiGetUserProfileImages = async (
  userID: string,
): Promise<File[]> => {
  return axios
    .get(`${apiUsersLink}/${userID}/images`, {
      headers: {
        Accept: "application/json",
      },
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
