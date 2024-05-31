/*
  Functions used to interact with the backend API.
*/

import { AccountSetupPageFormData } from "../types/AccountSetup";
import { API_HOST, API_PORT } from "../config";


// Account Setup

export const getIsAccountSetup = async (userId : string) : Promise<boolean> => {
  // Checks if the given user account is setup or not
  const getIsAccountSetupLink = `${API_HOST}:${API_PORT}/api/account/setup`

  var returnVal : boolean = false;

  try{
    await fetch(getIsAccountSetupLink, {
      method: 'GET', 
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      returnVal = data.isSetup;
    }) // TODO: error handling for bad response?
   
  } catch(error) {
    alert(`Error during sending account setup information to api: ${error}`)
  }

  return returnVal;
};

export const accountSetupSubmit = async ( formData : AccountSetupPageFormData ) : Promise<boolean>  => {
  // Submit User Account Setup Form
  
  // returns a boolean indicating whether account setup was good or not
  // true for good
  // false for bad

  const accountSetupLink = `${API_HOST}:${API_PORT}/api/account/setup`

  // Function to convert File to Base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Default return value false to indicate no succcess
  // Will be updated if API call succeeds
  var returnVal : boolean = false;

  try{

    // Convert avatar to Base64 string if it's not null, o.w. be an empty string
    const avatarBase64 = formData.avatar ? await fileToBase64(formData.avatar) : "";

    // Convert interests array to a single string
    const interestsString = formData.interests.join(',');

    // New object to store account data with the modified fields
    const accountDataSend = {
        ...formData,
        avatar: avatarBase64,
        interests: interestsString
      };

    const response = await fetch(accountSetupLink, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(accountDataSend)
    });

    if (response.ok) {
      returnVal = true;
    } else {
      alert(`API returned with error: ${response.status} - ${response.body}`)
    }
  } catch(error) {
    alert(`Error during sending account setup information to api: ${error}`)
  }

  return returnVal;
};

// Account Settings

// Delete Account Function
export const accountDelete = async ( ) : Promise<boolean> => {

  const accountDeleteLink = `${API_HOST}:${API_PORT}/api/account/delete`;
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