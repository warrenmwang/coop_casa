import {
  APICommunityReceived,
  Community,
  CommunityDetails,
} from "../types/Types";
import {
  apiCommunitiesLink,
  apiCommunitiesPropertiesLink,
  apiCommunitiesUsersLink,
} from "../urls";
import { apiFile2ClientFile } from "../utils/utils";
import {
  pageQPKey,
  filterDescriptionQPKey,
  filterNameQPKey,
  MAX_NUMBER_COMMUNITIES_PER_PAGE,
} from "../constants";
import axios from "axios";

export const apiGetCommunity = async (
  communityID: string,
): Promise<Community> => {
  return axios
    .get(`${apiCommunitiesLink}/${communityID}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.data)
    .then((data) => data as APICommunityReceived)
    .then((data) => {
      // For potentially nullable fields, check and if null replace with empty array
      const usersTmp: string[] = data.users !== null ? data.users : [];
      const propertiesTmp: string[] =
        data.properties !== null ? data.properties : [];
      let imagesTmp: File[] = [];
      if (data.images !== null) {
        imagesTmp = data.images.map((image) =>
          apiFile2ClientFile(image),
        ) as File[];
      }
      // Return full Community obj
      return {
        details: data.details,
        images: imagesTmp,
        users: usersTmp,
        properties: propertiesTmp,
      } as Community;
    });
};

export const apiGetCommunities = async (
  page: number,
  filterName: string,
  filterDescription: string,
): Promise<string[]> => {
  return axios
    .get(
      `${apiCommunitiesLink}?${pageQPKey}=${page}&${filterNameQPKey}=${filterName}&${filterDescriptionQPKey}=${filterDescription}&limit=${MAX_NUMBER_COMMUNITIES_PER_PAGE}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )
    .then((res) => res.data)
    .then((data) => {
      return data.communityIDs !== null ? (data.communityIDs as string[]) : [];
    });
};

export const apiCreateCommunity = async (
  community: Community,
): Promise<Response | null> => {
  // TODO: at creation time, allow adding users and properties
  // for now they are ignored here.

  const details: CommunityDetails = community.details;
  const images: File[] = community.images;

  const formData = new FormData();
  formData.append("details", JSON.stringify(details));
  formData.append("numImages", `${images.length}`);
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      formData.append(`image${i}`, images[i]);
    }
  }

  return axios.post(`${apiCommunitiesLink}`, formData, {
    withCredentials: true,
  });
};

export const apiCreateCommunityUser = async (
  communityId: string,
  userId: string,
): Promise<Response | null> => {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({ communityId: communityId, userId: userId }),
  );

  return axios.post(`${apiCommunitiesUsersLink}`, formData, {
    withCredentials: true,
  });
};

export const apiCreateCommunityProperty = async (
  communityId: string,
  propertyId: string,
): Promise<Response | null> => {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      communityId: communityId,
      propertyId: propertyId,
    }),
  );

  return axios.post(`${apiCommunitiesPropertiesLink}`, formData, {
    withCredentials: true,
  });
};

export const apiUpdateCommunity = async (
  community: Community,
): Promise<Response | null> => {
  const details: CommunityDetails = community.details;
  const images: File[] = community.images;

  const formData = new FormData();
  formData.append("details", JSON.stringify(details));
  formData.append("numImages", `${images.length}`);
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      formData.append(`image${i}`, images[i]);
    }
  }
  formData.append("userIDs", JSON.stringify(community.users));
  formData.append("propertyIDs", JSON.stringify(community.properties));

  return axios.put(`${apiCommunitiesLink}/${details.communityId}`, formData, {
    withCredentials: true,
  });
};

export const apiDeleteCommunity = async (
  communityId: string,
): Promise<Response | null> => {
  return axios.delete(`${apiCommunitiesLink}/${communityId}`, {
    withCredentials: true,
  });
};

export const apiDeleteCommunityUser = async (
  communityId: string,
  userId: string,
): Promise<Response | null> => {
  return axios.delete(
    `${apiCommunitiesUsersLink}?communityId=${communityId}&userId=${userId}`,
    {
      withCredentials: true,
    },
  );
};

export const apiDeleteCommunityProperty = async (
  communityId: string,
  propertyId: string,
): Promise<Response | null> => {
  return axios.delete(
    `${apiCommunitiesPropertiesLink}?communityId=${communityId}&propertyId=${propertyId}`,
    {
      withCredentials: true,
    },
  );
};
