import "@app/test-utils";
import {
  validateDate,
  validateEmail,
  validateUserAvatarInput,
  validateUserID,
  validateUUID,
} from "@app/utils/inputValidation";

describe("validateDate function", () => {
  const testCases = [
    { name: "valid date 1 passes", input: "2000-01-10", expected: true },
    { name: "valid date 2 passes", input: "1990-12-25", expected: true },
    {
      name: "invalid date (invalid month) gets caught",
      input: "1990-13-01",
      expected: false,
    },
    {
      name: "invalid date (invalid month 0) gets caught",
      input: "1990-00-01",
      expected: false,
    },
    {
      name: "invalid date (invalid day) gets caught",
      input: "1990-04-99",
      expected: false,
    },
    {
      name: "invalid date (invalid year) gets caught",
      input: "0000-04-15",
      expected: false,
    },
    {
      name: "invalid date (year in wrong spot) gets caught",
      input: "20-9990-23",
      expected: false,
    },
    {
      name: "invalid date (incorrect order) gets caught",
      input: "10-30-3902",
      expected: false,
    },
  ];

  test.each(testCases)("$name", ({ input, expected }) => {
    expect(validateDate(input)).toBe(expected);
  });
});

describe("validateEmail function", () => {
  const testCases = [
    { name: "valid email passes", input: "user@example.com", expected: true },
    {
      name: "valid email with subdomain passes",
      input: "user@sub.example.com",
      expected: true,
    },
    {
      name: "valid email with plus addressing passes",
      input: "user+tag@example.com",
      expected: true,
    },
    {
      name: "valid email with numbers passes",
      input: "user123@example.com",
      expected: true,
    },
    {
      name: "valid email with dots passes",
      input: "user.name@example.com",
      expected: true,
    },
    {
      name: "invalid email (no @) fails",
      input: "userexample.com",
      expected: false,
    },
    {
      name: "invalid email (no domain) fails",
      input: "user@.com",
      expected: false,
    },
    {
      name: "invalid email (no username) fails",
      input: "@example.com",
      expected: false,
    },
    {
      name: "invalid email (double @) fails",
      input: "user@@example.com",
      expected: false,
    },
    {
      name: "invalid email (no TLD) fails",
      input: "user@example",
      expected: false,
    },
    {
      name: "invalid email (spaces) fails",
      input: "user @example.com",
      expected: false,
    },
    {
      name: "invalid email (special chars) fails",
      input: "user!name@example.com",
      expected: false,
    },
    { name: "empty string fails", input: "", expected: false },
  ];

  test.each(testCases)("$name", ({ input, expected }) => {
    expect(validateEmail(input)).toBe(expected);
  });
});

describe("validateUUID function", () => {
  const testCases = [
    {
      name: "valid UUID v4 passes",
      input: "123e4567-e89b-12d3-a456-426614174000",
      expected: ["123e4567-e89b-12d3-a456-426614174000", true],
    },
    {
      name: "valid UUID v1 passes",
      input: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      expected: ["6ba7b810-9dad-11d1-80b4-00c04fd430c8", true],
    },
    {
      name: "invalid UUID (wrong format) fails",
      input: "123e4567-e89b-12d3-a456-42661417400",
      expected: ["", false],
    },
    {
      name: "invalid UUID (non-hex characters) fails",
      input: "123e4567-e89b-12d3-a456-42661417400g",
      expected: ["", false],
    },
    {
      name: "invalid UUID (missing hyphens) fails",
      input: "123e4567e89b12d3a456426614174000",
      expected: ["", false],
    },
    { name: "empty string fails", input: "", expected: ["", false] },
  ];

  test.each(testCases)("$name", ({ input, expected }) => {
    expect(validateUUID(input)).toEqual(expected);
  });
});

describe("validateUserID function", () => {
  const testCases = [
    {
      name: "valid userID (21 digits) passes",
      input: "123456789012345678901",
      expected: true,
    },
    {
      name: "valid userID (21 digits, different number) passes",
      input: "987654321098765432109",
      expected: true,
    },
    {
      name: "invalid userID (too short) fails",
      input: "12345678901234567890",
      expected: false,
    },
    {
      name: "invalid userID (too long) fails",
      input: "1234567890123456789012",
      expected: false,
    },
    {
      name: "invalid userID (contains letters) fails",
      input: "12345678901234567890a",
      expected: false,
    },
    {
      name: "invalid userID (contains special characters) fails",
      input: "12345678901234567890!",
      expected: false,
    },
    { name: "empty string fails", input: "", expected: false },
  ];

  test.each(testCases)("$name", ({ input, expected }) => {
    expect(validateUserID(input)).toBe(expected);
  });
});

describe("validateUserAvatarInput function", () => {
  // Define test cases
  const testCases = [
    {
      name: "valid JPEG file",
      file: { size: 1 * 1024 * 1024, type: "image/jpeg" } as File,
      expectedMessage: "",
      expectedValidity: true,
    },
    {
      name: "valid PNG file",
      file: { size: 2 * 1024 * 1024, type: "image/png" } as File,
      expectedMessage: "",
      expectedValidity: true,
    },
    {
      name: "valid GIF file",
      file: { size: 3 * 1024 * 1024, type: "image/gif" } as File,
      expectedMessage: "",
      expectedValidity: true,
    },
    {
      name: "oversized file",
      file: { size: 6 * 1024 * 1024, type: "image/jpeg" } as File,
      expectedMessage: "File size should not exceed 5 MiB.",
      expectedValidity: false,
    },
    {
      name: "invalid file type",
      file: { size: 1 * 1024 * 1024, type: "text/plain" } as File,
      expectedMessage: "Please upload a valid image file (JPEG, PNG, or GIF).",
      expectedValidity: false,
    },
  ];

  // Run tests for each case
  test.each(testCases)(
    "$name",
    ({ file, expectedMessage, expectedValidity }) => {
      const [message, isValid] = validateUserAvatarInput(file);
      expect(isValid).toBe(expectedValidity);
      expect(message).toBe(expectedMessage);
    },
  );
});
