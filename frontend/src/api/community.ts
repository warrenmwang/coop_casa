import { Community, CommunityDetails } from "@app/types/Types";
import {
  apiCommunitiesLink,
  apiCommunitiesPropertiesLink,
  apiCommunitiesUsersLink,
} from "@app/urls";
import { apiFile2ClientFile } from "@app/utils/utils";
import {
  PAGE_QP_KEY,
  FILTER_DESCRIPTION_QP_KEY,
  FILTER_NAME_QP_KEY,
  MAX_NUMBER_COMMUNITIES_PER_PAGE,
} from "@app/appConstants";
import axios from "axios";
import {
  APICommunityReceivedSchema,
  APIReceivedCommunityIDsSchema,
} from "@app/types/Schema";

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
    .then((data) => {
      const res = APICommunityReceivedSchema.safeParse(data);
      if (res.success) return res.data;
      throw new Error(
        "Validation failed: received community does not match expected schema",
      );
    })
    .then((data) => {
      // Transform apifiles to File
      return {
        details: data.details,
        images: data.images.map((image) => apiFile2ClientFile(image)) as File[],
        users: data.users,
        properties: data.properties,
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
      `${apiCommunitiesLink}?${PAGE_QP_KEY}=${page}&${FILTER_NAME_QP_KEY}=${filterName}&${FILTER_DESCRIPTION_QP_KEY}=${filterDescription}&limit=${MAX_NUMBER_COMMUNITIES_PER_PAGE}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )
    .then((res) => res.data)
    .then((data) => {
      const res = APIReceivedCommunityIDsSchema.safeParse(data);
      if (res.success) return res.data.communityIDs;
      throw new Error(
        "Validation failed: received communities does not match expected schema",
      );
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

export const apiTransferCommunity = async (
  communityID: string,
  userID: string,
) => {
  return axios.put(
    `${apiCommunitiesLink}/transfer/ownership?communityId=${communityID}&userId=${userID}`,
    {},
    {
      withCredentials: true,
    },
  );
};
