import {
  FILTER_ADDRESS_QP_KEY,
  MAX_NUMBER_PROPERTIES_PER_PAGE,
  PAGE_QP_KEY,
} from "@app/appConstants";
import {
  APIPropertyReceivedSchema,
  APIReceivedPropertyIDsSchema,
} from "@app/types/Schema";
import { OrderedFile, Property } from "@app/types/Types";
import { apiPropertiesLink } from "@app/urls";
import { apiFile2ClientFile } from "@app/utils/utils";

export async function apiCreateNewProperty(
  property: Property,
): Promise<Response | null> {
  const formData = new FormData();
  formData.append("details", JSON.stringify(property.details));
  formData.append("numImages", `${property.images.length}`);
  if (property.images.length > 0) {
    for (let i = 0; i < property.images.length; i++) {
      const image = property.images[i];
      formData.append(`image${image.orderNum}`, image.file);
    }
  }

  return fetch(apiPropertiesLink, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
}

export async function apiUpdateProperty(
  property: Property,
): Promise<Response | null> {
  const formData = new FormData();
  formData.append("details", JSON.stringify(property.details));
  formData.append("numImages", `${property.images.length}`);
  if (property.images.length > 0) {
    for (let i = 0; i < property.images.length; i++) {
      const image = property.images[i];
      formData.append(`image${image.orderNum}`, image.file);
    }
  }

  return fetch(`${apiPropertiesLink}/${property.details.propertyId}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
}

export async function apiTransferProperty(
  propertyID: string,
  userID: string,
): Promise<string> {
  await fetch(
    `${apiPropertiesLink}/transfer/ownership?propertyId=${propertyID}&userId=${userID}`,
    {
      method: "PUT",
      credentials: "include",
    },
  );
  return userID;
}

export async function apiTransferAllProperties(
  userID: string,
): Promise<string> {
  await fetch(`${apiPropertiesLink}/transfer/ownership/all?userId=${userID}`, {
    method: "POST",
    credentials: "include",
  });
  return userID;
}

// Get a single property based off of id
export async function apiGetProperty(propertyID: string): Promise<Property> {
  const response = await fetch(`${apiPropertiesLink}/${propertyID}`, {
    headers: {
      Accept: "application/json",
    },
  });
  const data = await response.json();
  const res = APIPropertyReceivedSchema.safeParse(data);
  if (!res.success) {
    throw new Error(
      "Validation failed: received property does not match expected schema",
    );
  }
  const validatedData = res.data;
  return {
    details: validatedData.details,
    images: validatedData.images.map((image) => ({
      orderNum: image.orderNum,
      file: apiFile2ClientFile(image.file),
    })) as OrderedFile[],
  } as Property;
}

// Get a page of property ids
export async function apiGetProperties(
  page: number,
  filterAddress: string,
): Promise<string[]> {
  if (filterAddress === undefined) filterAddress = "";
  const response = await fetch(
    `${apiPropertiesLink}?${PAGE_QP_KEY}=${page}&${FILTER_ADDRESS_QP_KEY}=${filterAddress}&limit=${MAX_NUMBER_PROPERTIES_PER_PAGE}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
  const data = await response.json();
  const res = APIReceivedPropertyIDsSchema.safeParse(data);
  if (!res.success) {
    throw new Error(
      "Validation failed: received property ids does not match expected schema",
    );
  }
  return res.data.propertyIDs;
}

export async function apiDeleteProperty(propertyID: string): Promise<string> {
  await fetch(`${apiPropertiesLink}/${propertyID}`, {
    method: "DELETE",
    credentials: "include",
  });
  return propertyID;
}
