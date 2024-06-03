/*
  Functions used to interact with the backend API.
*/

import { MaybeUser, User } from "../types/User";
import { api_account_Link, api_account_update_Link } from "../urls";

// Account Settings

// Delete Account Function
export const accountDelete = async ( ) : Promise<boolean> => {

  var returnVal : boolean = false;

  try {
    const response = await fetch(api_account_Link, {
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
  var returnVal : MaybeUser = undefined

  try {
    const response = await fetch(api_account_Link, {
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