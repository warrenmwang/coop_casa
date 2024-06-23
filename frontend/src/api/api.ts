/*
  Functions used to interact with the backend API.
*/

import { useEffect, useState } from "react";
import { NullUser, User } from "../types/User";
import { Property } from "../components/structure/CreatePropertyForm";
import {
  api_account_Link,
  api_account_update_Link,
  api_auth_check_link,
  api_auth_logout_Link,
  api_properties_Link,
  api_user_role_Link,
} from "../urls";
import { AuthData } from "../auth/AuthWrapper";
import { GlobalStore } from "../globalStore";

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
): Promise<number> => {
  var returnVal: number = 444;

  try {
    const response = await fetch(api_account_update_Link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newUserData),
    });

    returnVal = response.status;
  } catch (error) {
    alert(`Received error during update user account details: ${error}`);
  }

  return returnVal;
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
    const controller = new AbortController();

    fetch(api_account_Link, {
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
        const userData = data as NullUser;
        if (userData !== null) {
          setUser(userData as User);
        }
        setLoading(false);
      })
      .catch((err) => console.error(err));

    return () => controller.abort();
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
  var returnVal: Response | null = null;
  try {
    const response = await fetch(api_properties_Link, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(property),
      credentials: "include",
    });
    returnVal = response;
  } catch (err) {
    alert(`Received error during property creation: ${err}`);
  }
  return returnVal;
};

// Get user properties api hook
export const useAPIGetProperties = (limit: number, offset: number): boolean => {
  // assume in global store context
  const globalStore = GlobalStore();
  const { setCurrProperties } = globalStore;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${api_properties_Link}?limit=${limit}&offset=${offset}`, {
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
        setCurrProperties(data as Property[]);
        setLoading(false);
      })
      .catch((err) => console.error(err));

    return () => controller.abort();
  }, []);

  return loading;
};
