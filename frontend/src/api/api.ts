/*
  Functions used to interact with the backend API.
*/

import { useEffect, useState } from "react";
import {
  User,
  ListerBasicInfo,
  APIUserReceived,
  Property,
  APIPropertyReceived,
  OrderedFile,
} from "../types/Types";
import {
  api_account_Link,
  api_account_update_Link,
  api_auth_check_link,
  api_auth_logout_Link,
  api_lister_Link,
  api_properties_Link,
  api_user_role_Link,
} from "../urls";
import { AuthData } from "../auth/AuthWrapper";
import { apiFile2ClientFile } from "../utils/utils";
import axios from "axios";

export const checkFetch = (response: Response) => {
  // source: https://www.youtube.com/watch?v=b8DaQrxshu0
  if (!response.ok) {
    throw Error(response.statusText + " - " + response.url);
  }
  return response;
};

// Delete Account Function
export const apiAccountDelete = async (): Promise<boolean> => {
  // Return true for ok, else false for not ok response
  // or alert for error and return false

  var returnVal: boolean = false;

  try {
    const response = await fetch(api_account_Link, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      returnVal = true;
    }
  } catch (error) {
    alert(`Received error during account deletion: ${error}`);
  }

  return returnVal;
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

  return fetch(api_account_update_Link, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
};

// Log out user from system, end session by invalidating the client side token
export const apiLogoutUser = async (): Promise<boolean> => {
  // Return true for successful logout, else false
  // or alert for error and return false

  var returnVal: boolean = false;

  // Logout the user in the api backend as well
  try {
    const response = await fetch(api_auth_logout_Link, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok || response.status === 307) {
      returnVal = true;
    }
  } catch (error) {
    alert(`Received error during logout of user: ${error}`);
  }

  return returnVal;
};

export const useAPIAuthCheck = (): boolean => {
  // Assuming that all components are under the global Auth Context
  const auth = AuthData();
  const { setAuthenticated } = auth;

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(api_auth_check_link, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then(checkFetch)
      .then((response) => response.json())
      .then((data) => {
        const accIsAuthed = data.accountIsAuthed as boolean;
        setLoading(false);
        setAuthenticated(accIsAuthed);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => controller.abort();
  }, []);

  return loading;
};

export const useAPIGetUserAccount = (): boolean => {
  // Assuming that all components are under the global Auth Context
  const auth = AuthData();
  const { setUser } = auth;

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const foo = async () => {
      const controller = new AbortController();

      fetch(api_account_Link, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      })
        .then(checkFetch)
        .then((response) => response.json())
        .then((data) => data as APIUserReceived)
        .then((data) => {
          const avatar: File | null = apiFile2ClientFile(data.avatarImageB64);

          setUser({
            ...data.userDetails,
            avatar: avatar,
          });

          setLoading(false);
        })
        .catch((err) => console.error(err));

      return () => controller.abort();
    };
    foo();
  }, []);

  return loading;
};

export const useAPIGetUserRole = (): boolean => {
  // Assuming that all components are under the global Auth Context
  const auth = AuthData();
  const { setUserRole } = auth;

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(api_user_role_Link, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then(checkFetch)
      .then((response) => response.json())
      .then((data) => {
        const userRole = data.role as string;
        setUserRole(userRole);
        setLoading(false);
      })
      .catch((err) => console.error(err));

    return () => controller.abort();
  }, []);

  return loading;
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

  // return fetch(api_properties_Link, {
  //   method: "PUT",
  //   body: formData,
  //   credentials: "include",
  // });
  return axios.put(api_properties_Link, formData, {
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

  return fetch(api_properties_Link, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

// Get a single property based off of id
export const apiGetProperty = async (propertyID: string): Promise<Property> => {
  return fetch(`${api_properties_Link}?propertyID=${propertyID}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(checkFetch)
    .then((response) => response.json())
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
    })
    .catch((error) => {
      throw error;
    });
};

// Get a page of property ids
export const apiGetProperties = async (page: number): Promise<string[]> => {
  return fetch(`${api_properties_Link}?page=${page}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(checkFetch)
    .then((response) => response.json())
    .then((data) => {
      const tmp = data as string[];
      if (tmp == null) {
        // no more property ids in db
        return [];
      }
      return tmp;
    })
    .catch((error) => {
      throw error;
    });
};

export const apiDeleteProperty = async (
  propertyID: string,
): Promise<Response | null> => {
  return fetch(`${api_properties_Link}?propertyID=${propertyID}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// Get total count of properties in db
export const apiGetTotalCountProperties = async (): Promise<number> => {
  return fetch(`${api_properties_Link}?getTotalCount=true`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(checkFetch)
    .then((response) => response.json())
    .then((data) => data as number)
    .catch((error) => {
      throw error;
    });
};

// Get lister info
export const apiGetListerInfo = async (
  listerID: string,
): Promise<ListerBasicInfo> => {
  return fetch(`${api_lister_Link}?listerID=${listerID}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(checkFetch)
    .then((response) => response.json())
    .then((data) => data as ListerBasicInfo)
    .catch((error) => {
      throw error;
    });
};
