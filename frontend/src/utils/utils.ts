import { APIFileReceived, OrderedFile, UserDetails } from "../types/Types";

// Takes an object that is our custom, backend representation of the actual
// contents and some metadata of an arbitrary binary file and converts it into
// a standard JS File type.
export const apiFile2ClientFile = (fileIn: APIFileReceived): File | null => {
  // Return null if empty file
  if (fileIn.data === "") {
    return null;
  }

  // Decode the base64 string
  const binaryString = window.atob(fileIn.data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob from the byte array
  const blob = new Blob([bytes], { type: fileIn.mimeType });

  // Convert the Blob into a File object
  return new File([blob], fileIn.fileName, { type: fileIn.mimeType });
};

export const orderedFileArray2FileArray = (arr: OrderedFile[]): File[] => {
  const newArr: File[] = Array(arr.length);
  let file: OrderedFile;
  for (let i = 0; i < arr.length; i++) {
    file = arr[i];
    newArr[file.orderNum] = file.file;
  }
  return newArr;
};

export const fileArray2OrderedFileArray = (arr: File[]): OrderedFile[] => {
  const newArr: OrderedFile[] = Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    newArr[i] = {
      orderNum: i,
      file: arr[i],
    } as OrderedFile;
  }
  return newArr;
};

export function isAccountSetup(userDetails: UserDetails): boolean {
  if (userDetails.firstName.trim() === "") return false;
  if (userDetails.lastName.trim() === "") return false;
  if (userDetails.birthDate.trim() === "") return false;
  if (userDetails.gender.trim() === "") return false;
  if (userDetails.location.trim() === "") return false;
  if (userDetails.interests.length === 0) return false;
  for (const interest of userDetails.interests) {
    if (interest.trim().length === 0) return false;
  }
  return true;
}
