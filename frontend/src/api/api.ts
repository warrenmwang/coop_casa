/*
  Functions used to interact with the backend API.
*/

import { MaybeUser, User } from "../types/User";
import { api_account_Link, api_account_update_Link, api_logout_Link } from "../urls";

// Delete Account Function
export const accountDelete = async ( ) : Promise<boolean> => {
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
    alert(`Error during account deletion: ${error}`)
  }

  return returnVal;
}

// Query for user account information
export const getUserAccountDetails = async () : Promise<MaybeUser> => {
  var returnVal : MaybeUser = undefined

  try {
    const response = await fetch(api_account_Link, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      credentials: "include"
    })
    
    if (response.ok) {
      returnVal = (await response.json()) as MaybeUser
    } 
  } catch (error) {
    alert(`Error during request user details: ${error}`)
  }

  return returnVal;
}

// Update Account Details
export const updateUserAccountDetails = async (newUserData : User) : Promise<boolean> => {
  // Return true for ok, else false for not ok response
  // or alert for error and return false

  var returnVal : boolean = false;

  try {

    const response = await fetch(api_account_update_Link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(newUserData)
    })

    if (response.ok) {
      returnVal = true
    } 

  } catch(error) {
    alert(`Received error during update user account details: ${error}`)
  }

  return returnVal;
}

// Log out user from system, end session by invalidating the client side token
export const logoutUser = async () : Promise<boolean> => {
  // Return true for ok, else false for not ok response
  // or alert for error and return false

  var returnVal : boolean = false

  // Logout the user in the api backend as well
  try {
    const response = await fetch(api_logout_Link, {
      method: "GET", 
      credentials: "include",
    });

    if (response.ok) {
      returnVal = true
    }

  } catch(error) {
    alert(`Error during logout: ${error}`)
  }

  return returnVal
}