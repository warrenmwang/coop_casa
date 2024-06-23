// Function to convert File to Base64 string

import { AvatarType } from "../types/AccountSetup";

// Returns an empty string if file is null
// o.w. return the file as base64 encoded string
export const fileToBase64 = (file: AvatarType): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file !== null) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    } else {
      resolve("");
      reject(new Error("Something went wrong."));
    }
  });
};
