/*
  Functions used to interact with the backend API.
*/

import { useEffect, useState } from "react";
import { NullUser, User } from "../types/User";
import { api_account_Link, api_account_update_Link, api_auth_check_link, api_auth_logout_Link } from "../urls";
import { AuthData } from "../auth/AuthWrapper";

const checkFetch = (response : Response) => {
  // source: https://www.youtube.com/watch?v=b8DaQrxshu0
  if (!response.ok) {
    throw Error(response.statusText + " - " + response.url)
  }
  return response
}

// Delete Account Function
export const apiAccountDelete = async ( ) : Promise<boolean> => {
  // Return true for ok, else false for not ok response
  // or alert for error and return false

  var returnVal : boolean = false

  try {
    const response = await fetch(api_account_Link, {
      method: "DELETE", 
      credentials: "include",
    })

    if (response.ok) {
      returnVal = true
    } 

  } catch(error) {
    alert(`Received error during account deletion: ${error}`)
  }

  return returnVal;
}

// Query for user account information
// export const apiGetUserAccountDetails = async () : Promise<GetUserAccountDetailsAPIResponse> => {
//   var returnVal : GetUserAccountDetailsAPIResponse = [444, undefined]

//   try {
//     const response = await fetch(api_account_Link, {
//       method: "GET",
//       headers: {
//         "Accept": "application/json"
//       },
//       credentials: "include"
//     })
    
//     if (response.ok) {
//       returnVal = [response.status, (await response.json()) as NullUser]
//     } else if (response.status === 405) {
//       // Allow 405 to go thru bc 405 just means invalid token, which happens a lot
//       returnVal = [response.status, undefined]
//     }
//   } catch (error) {
//     alert(`Received error during get user details: ${error}`)
//   }

//   return returnVal;
// }

// Update Account Details
export const apiUpdateUserAccountDetails = async (newUserData : User) : Promise<number> => {
  var returnVal : number = 444

  try {
    const response = await fetch(api_account_update_Link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(newUserData)
    })

    returnVal = response.status

  } catch(error) {
    alert(`Received error during update user account details: ${error}`)
  }

  return returnVal
}

// Log out user from system, end session by invalidating the client side token
export const apiLogoutUser = async () : Promise<boolean> => {
  // Return true for successful logout, else false
  // or alert for error and return false

  // console.log("apiLogoutUser")

  var returnVal : boolean = false

  // Logout the user in the api backend as well
  try {
    const response = await fetch(api_auth_logout_Link, {
      method: "GET", 
      credentials: "include",
    });

    // console.log(`apiLogoutUser response:`, response)

    if (response.ok || response.status === 307) {
      returnVal = true
    }
    
    // console.log(`apiLogoutUser returnVal: ${returnVal}`)

  } catch(error) {
    alert(`Received error during logout of user: ${error}`)
  }

  return returnVal
}

// Simple auth check ping to backend
// Returns true for authed
// else false for not
// export const apiAuthCheck = async () : Promise<boolean> => {

//   // console.log("apiAuthCheck")

//   var returnVal : boolean = false

//   try {
//     const response = await fetch(api_auth_check_link, {
//       method: "GET",
//       headers: {
//         "Accept": "application/json"
//       },
//       credentials: "include" // Include cookies in the request
//     })

//     // console.log(`apiAuthCheck response:`, response)

//     if (response.ok) {
//       const responseJSON = await response.json()
//       returnVal = responseJSON.accountIsAuthed as boolean
//     } 

//     // console.log(`apiAuthCheck returnVal: ${returnVal}`)

//   } catch (error) {
//     // TODO: well fuck it, just don't alert when this fails
//     // bc i don't have a fucking clue why we encounter the erroneous
//     // TypeError: Failed to fetch
//     // But the app still works if we ignore this so whatever bruh.

//     // alert(`Error checking auth status: ${error}`)
//   }

//   return returnVal
// }

export const useAPIAuthCheck = () : boolean => {
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
        "Accept": "application/json"
      }, 
      credentials: "include"
    })
    .then(checkFetch)
    .then(response => response.json())
    .then(data => {
      const accIsAuthed = data.accountIsAuthed as boolean;
      setLoading(false);
      setAuthenticated(accIsAuthed)
    })
    .catch((err) => {console.error(err)});

    return () => controller.abort();
  }, []);

  return loading;
};

export const useAPIGetUserAccount = () : boolean => {
  // Assuming that all components are under the global Auth Context
  const auth = AuthData();
  const { setUser } = auth;

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(api_account_Link, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      credentials: "include",
      signal: controller.signal
    })
    .then(checkFetch)
    .then(response => response.json()) 
    .then(data => {
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
}