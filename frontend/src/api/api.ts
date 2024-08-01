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
} from "../types/Types";
import {
  apiAccountLink,
  apiAccountUpdateLink,
  apiAuthCheckLink,
  apiAuthLogoutLink,
  apiListerLink,
  apiPropertiesLink,
  apiUserRoleLink,
} from "../urls";
import { apiFile2ClientFile } from "../utils/utils";
import axios from "axios";
import { addressFilterQPKey, pageQPKey } from "../components/DisplayProperties";

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

  return axios.put(apiPropertiesLink, formData, {
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

  return axios.post(apiPropertiesLink, formData, {
    withCredentials: true,
  });
};

// Get a single property based off of id
export const apiGetProperty = async (propertyID: string): Promise<Property> => {
  return axios
    .get(`${apiPropertiesLink}?propertyID=${propertyID}`, {
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
  addressFilter: string,
): Promise<string[]> => {
  if (addressFilter === undefined) addressFilter = "";
  return axios
    .get(
      `${apiPropertiesLink}?${pageQPKey}=${page}&${addressFilterQPKey}=${addressFilter}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )
    .then((res) => res.data)
    .then((data) => {
      const tmp = data as string[];
      if (tmp == null) {
        // no more property ids in db
        return [];
      }
      return tmp;
    });
};

export const apiDeleteProperty = async (
  propertyID: string,
): Promise<Response | null> => {
  return axios.delete(`${apiPropertiesLink}?propertyID=${propertyID}`, {
    withCredentials: true,
  });
};

// Unused
// Get total count of properties in db
// export const apiGetTotalCountProperties = async (): Promise<number> => {
//   return fetch(`${api_properties_Link}?getTotalCount=true`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//   })
//     .then(checkFetch)
//     .then((response) => response.json())
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
