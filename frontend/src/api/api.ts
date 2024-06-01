/*
  Functions used to interact with the backend API.
*/

import { MaybeUser, User } from "../types/User";
import { API_HOST, API_PORT } from "../config";

// Account Settings

// Delete Account Function
export const accountDelete = async ( ) : Promise<boolean> => {

  const accountDeleteLink = `${API_HOST}:${API_PORT}/api/account`;
  var returnVal : boolean = false;

  try {
    const response = await fetch(accountDeleteLink, {
      method: "DELETE", 
      credentials: "include",
    })

    if (response.ok) {
      returnVal = true;
    }

  } catch(error) {
    alert(`Error during account deletion: ${error}`)
  }

  return returnVal;
}

// Query for user account information
export const getUserAccountDetails = async () : Promise<MaybeUser> => {
  const getUserAccountDetailsLink = `${API_HOST}:${API_PORT}/api/account`
  var returnVal : MaybeUser = undefined

  try {
    const response = await fetch(getUserAccountDetailsLink, {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      },
      credentials: "include"
    })
    
    if (response.ok) {
      returnVal = (await response.json()) as MaybeUser
    } else {
      throw new Error("Request to fetch user data details to backend failed.")
    }
  } catch (error) {
    alert(`Error during request user details: ${error}`)
  }

  return returnVal;
}

// Update Account Details
export const updateUserAccountDetails = async (newUserData : User) : Promise<boolean> => {
  var returnVal : boolean = false;
  const updateUserAccountDetailsLink = `${API_HOST}:${API_PORT}/api/account/update`

  try {

    const response = await fetch(updateUserAccountDetailsLink, {
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