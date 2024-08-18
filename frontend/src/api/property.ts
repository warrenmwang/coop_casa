import {
  Property,
  APIPropertyReceived,
  OrderedFile,
  ListerBasicInfo,
} from "../types/Types";
import { apiPropertiesLink, apiListerLink } from "../urls";
import {
  pageQPKey,
  filterAddressQPKey,
  MAX_NUMBER_PROPERTIES_PER_PAGE,
} from "../constants";
import { apiFile2ClientFile } from "../utils/utils";

import axios from "axios";

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
