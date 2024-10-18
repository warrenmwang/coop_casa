/*
  Place to store constants that are used throughout the application.
*/

export const MAX_TEXT_INPUT_LENGTH = 100;
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MiB
export const MAX_PROPERTY_IMGS_ALLOWED = 10;
export const MAX_USER_PROFILE_IMGS_ALLOWED = 10;
export const MAX_COMMUNITY_IMGS_ALLOWED = 5;
export const MAX_NUMBER_PROPERTIES_PER_PAGE = 9;
export const MAX_NUMBER_COMMUNITIES_PER_PAGE = 9;
export const MAX_NUMBER_USER_PROFILES_PER_PAGE = 9;
export const MAX_USERS_PER_PAGE = 10;
export const LIKED_ENTITIES_DISPLAY_NUM_PREVIEW = 3;

export const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Transgender Woman",
  "Transgender Man",
  "Non-binary",
  "Agender",
  "Prefer Not To State",
];

export const INTERESTS_OPTIONS = [
  "Reading",
  "Traveling",
  "Cooking",
  "Swimming",
  "Gaming",
  "Sports",
  "Music",
  "Art",
  "Technology",
  "Politics",
  "Writing",
  "Social Justice",
  "History",
  "Dance",
];

export const USER_STATUS_OPTIONS = ["normal", "private", "flagged"];
export const USER_STATUS_NORMAL = "normal";
export const USER_STATUS_PRIVATE = "private";
export const USER_STATUS_FLAGGED = "flagged";

export const USER_ROLE_OPTIONS = ["lister", "regular"];
export const USER_ROLE_LISTER = "lister";
export const USER_ROLE_REGULAR = "regular";

export const pageQPKey = "page";
export const limitQPKey = "limit";

export const filterNameQPKey = "communityFilterName";
export const filterDescriptionQPKey = "communityFilterDescription";

export const filterAddressQPKey = "filterAddress";

export const filterFirstNameQPKey = "filterFirstName";
export const filterLastNameQPKey = "filterLastName";
