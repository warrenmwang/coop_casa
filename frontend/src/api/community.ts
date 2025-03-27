import {
  FILTER_DESCRIPTION_QP_KEY,
  FILTER_NAME_QP_KEY,
  MAX_NUMBER_COMMUNITIES_PER_PAGE,
  PAGE_QP_KEY,
} from "@app/appConstants";
import {
  APICommunityReceivedSchema,
  APIReceivedCommunityIDsSchema,
} from "@app/types/Schema";
import { Community, CommunityDetails } from "@app/types/Types";
import {
  apiCommunitiesLink,
  apiCommunitiesPropertiesLink,
  apiCommunitiesUsersLink,
} from "@app/urls";
import { apiFile2ClientFile } from "@app/utils/utils";

export async function apiGetCommunity(communityID: string): Promise<Community> {
  return fetch(`${apiCommunitiesLink}/${communityID}`, {
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
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
}

export async function apiGetCommunities(
  page: number,
  filterName: string,
  filterDescription: string,
): Promise<string[]> {
  return fetch(
    `${apiCommunitiesLink}?${PAGE_QP_KEY}=${page}&${FILTER_NAME_QP_KEY}=${filterName}&${FILTER_DESCRIPTION_QP_KEY}=${filterDescription}&limit=${MAX_NUMBER_COMMUNITIES_PER_PAGE}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((res) => res.json())
    .then((data) => {
      const res = APIReceivedCommunityIDsSchema.safeParse(data);
      if (res.success) return res.data.communityIDs;
      throw new Error(
        "Validation failed: received communities does not match expected schema",
      );
    });
}

export async function apiCreateCommunity(
  community: Community,
): Promise<Response | null> {
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

  return fetch(`${apiCommunitiesLink}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiCreateCommunityUser(
  communityId: string,
  userId: string,
): Promise<Response | null> {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({ communityId: communityId, userId: userId }),
  );

  return fetch(`${apiCommunitiesUsersLink}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiCreateCommunityProperty(
  communityId: string,
  propertyId: string,
): Promise<Response | null> {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      communityId: communityId,
      propertyId: propertyId,
    }),
  );

  return fetch(`${apiCommunitiesPropertiesLink}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
}

export async function apiUpdateCommunity(
  community: Community,
): Promise<Response | null> {
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

  return fetch(`${apiCommunitiesLink}/${details.communityId}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
}

export async function apiDeleteCommunity(
  communityId: string,
): Promise<Response | null> {
  return fetch(`${apiCommunitiesLink}/${communityId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function apiDeleteCommunityUser(
  communityId: string,
  userId: string,
): Promise<Response | null> {
  return fetch(
    `${apiCommunitiesUsersLink}?communityId=${communityId}&userId=${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
}

export async function apiDeleteCommunityProperty(
  communityId: string,
  propertyId: string,
): Promise<Response | null> {
  return fetch(
    `${apiCommunitiesPropertiesLink}?communityId=${communityId}&propertyId=${propertyId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
}

export async function apiTransferCommunity(
  communityID: string,
  userID: string,
): Promise<Response> {
  return fetch(
    `${apiCommunitiesLink}/transfer/ownership?communityId=${communityID}&userId=${userID}`,
    {
      method: "PUT",
      credentials: "include",
    },
  );
}
