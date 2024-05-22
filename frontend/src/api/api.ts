/*
  Functions used to interact with the backend API.
*/

import { AccountSetupPageFormData } from "../types/AccountSetup";

// Account Setup

export const getIsAccountSetup = async (userId : string) : Promise<boolean> => {
  // TODO: Checks if the given user account is setup or not

  return false;
};

export const accountSetupSubmit = async ( formData : AccountSetupPageFormData ) => {
  // TODO: hit the backend account setup endpoint to submit the inputted user data
};