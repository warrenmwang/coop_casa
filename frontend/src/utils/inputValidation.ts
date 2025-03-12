import { MAX_IMAGE_FILE_SIZE } from "@app/appConstants";
import { z } from "zod";

export const validateDate = (value: string): boolean => {
  // First test date format via regular expression
  const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
  if (!datePattern.test(value)) return false;
  // Second test with zod
  const tmp = z.string().date().safeParse(value);
  if (!tmp.success) return false;
  // Date must be at least 1000-01-01 (arbitrary)
  return Date.parse(tmp.data) >= Date.parse("1000-01-01");
};

export const validateEmail = (value: string): boolean => {
  // First test with regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return false;
  // Second test with zod
  return z.string().email().safeParse(value).success;
};

export const validateUserAvatarInput = (file: File): [string, boolean] => {
  const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

  // Check file size
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return ["File size should not exceed 5 MiB.", false];
  }

  // Check file type is valid image
  if (!validImageTypes.includes(file.type)) {
    return ["Please upload a valid image file (JPEG, PNG, or GIF).", false];
  }

  return ["", true];
};

export const validateUUID = (uuid: string): [string, boolean] => {
  const { data, success } = z.string().uuid().safeParse(uuid);
  return success ? [data, success] : ["", success];
};

export const validateUserID = (userID: string): boolean => {
  const tmp = z.string().length(21).safeParse(userID);
  if (!tmp.success) return false;
  return z.coerce.number().safeParse(tmp.data).success;
};
