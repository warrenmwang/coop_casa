/*
  Functions used to interact with the backend API.
*/
import {
  User,
  ListerBasicInfo,
  APIUserReceived,
  Property,
  APIPropertyReceived,
  OrderedFile,
  APICommunityReceived,
  Community,
  CommunityDetails,
} from "../types/Types";
import {
  apiAccountLink,
  apiAccountUpdateLink,
  apiAuthCheckLink,
  apiAuthLogoutLink,
  apiCommunitiesLink,
  apiCommunitiesPropertiesLink,
  apiCommunitiesUsersLink,
  apiListerLink,
  apiPropertiesLink,
  apiUserRoleLink,
} from "../urls";
import { apiFile2ClientFile } from "../utils/utils";
import axios from "axios";
import { filterAddressQPKey, pageQPKey } from "../components/DisplayProperties";
import {
  filterDescriptionQPKey,
  filterNameQPKey,
  MAX_NUMBER_PROPERTIES_PER_PAGE,
  MAX_NUMBER_COMMUNITIES_PER_PAGE,
} from "../constants";

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

export const apiCreateNewProperty = async (
  property: Property,
): Promise<Response | null> => {
  const formData = new FormData();
  formData.append("details", JSON.stringify(property.details));
  formData.append("numImages", `${property.images.length}`);
  if (property.images.length > 0) {
    for (let i = 0; i < property.images.length; i++) {
      let image = property.images[i];
      formData.append(`image${image.orderNum}`, image.file);
    }
  }

  return axios.post(apiPropertiesLink, formData, {
    withCredentials: true,
  });
};

export const apiUpdateProperty = async (
  property: Property,
): Promise<Response | null> => {
  const formData = new FormData();
  formData.append("details", JSON.stringify(property.details));
  formData.append("numImages", `${property.images.length}`);
  if (property.images.length > 0) {
    for (let i = 0; i < property.images.length; i++) {
      let image = property.images[i];
      formData.append(`image${image.orderNum}`, image.file);
    }
  }

  return axios.put(
    `${apiPropertiesLink}/${property.details.propertyId}`,
    formData,
    {
      withCredentials: true,
    },
  );
};

// Get a single property based off of id
export const apiGetProperty = async (propertyID: string): Promise<Property> => {
  return axios
    .get(`${apiPropertiesLink}/${propertyID}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.data)
    .then((data) => data as APIPropertyReceived)
    .then((data) => {
      return {
        details: data.details,
        images: data.images.map((image) => {
          return {
            orderNum: image.orderNum,
            file: apiFile2ClientFile(image.file),
          };
        }) as OrderedFile[],
      } as Property;
    });
};

// Get a page of property ids
export const apiGetProperties = async (
  page: number,
  filterAddress: string,
): Promise<string[]> => {
  if (filterAddress === undefined) filterAddress = "";
  return axios
    .get(
      `${apiPropertiesLink}?${pageQPKey}=${page}&${filterAddressQPKey}=${filterAddress}&limit=${MAX_NUMBER_PROPERTIES_PER_PAGE}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )
    .then((res) => res.data)
    .then((data) => {
      if (data === null) {
        return []; // no more property ids in db
      }
      return data as string[];
    });
};

export const apiDeleteProperty = async (
  propertyID: string,
): Promise<Response | null> => {
  return axios.delete(`${apiPropertiesLink}/${propertyID}`, {
    withCredentials: true,
  });
};

// Unused
// Get total count of properties in db
// export const apiGetTotalCountProperties = async (): Promise<number> => {
//   return axios
//     .get(`${apiPropertiesLink}/total`, {
//       withCredentials: true,
//     })
//     .then((response) => response.data)
//     .then((data) => data as number)
//     .catch((error) => {
//       throw error;
//     });
// };

// Get lister info
export const apiGetListerInfo = async (
  listerID: string,
): Promise<ListerBasicInfo> => {
  return axios
    .get(`${apiListerLink}?listerID=${listerID}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.data)
    .then((data) => data as ListerBasicInfo);
};

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
      if (data === null) {
        return []; // no more communities
      }
      return data as string[];
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
