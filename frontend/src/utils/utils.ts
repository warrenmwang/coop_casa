import { APIFileReceived } from "../types/Types";

// Function to convert a File to Base64 string, useful for arbitrary binary format
// user input into a string format for passing it around (i.e. serializing and sending over network)
// Returns an empty string if file is null o.w. return the file as base64 encoded string
export const file2Base64Str = (file: File): Promise<string> => {
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

export const createFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};
