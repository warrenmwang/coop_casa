import { toast } from "react-toastify";
import { z } from "zod";
import { MAX_TEXT_INPUT_LENGTH, MAX_IMAGE_FILE_SIZE } from "../constants";

export const validateTextLength = (value: string): boolean => {
  // Check if the value length exceeds our MAX_TEXT_INPUT_LENGTH characters
  return value.length <= MAX_TEXT_INPUT_LENGTH;
};

export const validateDate = (value: string): boolean => {
  // Validate the date format via regular expression
  const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
  return datePattern.test(value);
};

export const validateEmail = (value: string): boolean => {
  // Validate email format via regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validateUserAvatarInput = (file: File): boolean => {
  const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

  // Check file size
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    toast.error("File size should not exceed 5 MiB.");
    return false;
  }

  // Check file type is valid image
  if (!validImageTypes.includes(file.type)) {
    return false;
  }

  return true;
};

export const validateNumber = (n: string): boolean => {
  // Validate that string is a number (return true if is a number, else false if not)
  // source: https://stackoverflow.com/a/68007988
  return !isNaN(+n);
};

export const validateUUID = (uuid: string): [string, boolean] => {
  const { data, success } = z.string().uuid().safeParse(uuid);
  if (success) return [data, success];
  else return ["", success];
};

export const validateUserID = (userID: string): boolean => {
  const { success } = z.coerce.number().safeParse(userID);
  return success;
};
