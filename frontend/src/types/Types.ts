export type NullUser = User | null;

export type User = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  location: string;
  interests: string;
  avatar: File | null;
};

export type APIUserReceived = {
  userDetails: UserDetails;
  avatarImageB64: APIFileReceived;
};

export type APIFileReceived = {
  fileName: string;
  mimeType: string;
  size: number; // in bytes
  data: string; // base64 encoding of binary content of file
};

export type UserDetails = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  location: string;
  interests: string;
};

export type ListerBasicInfo = {
  firstName: string;
  lastName: string;
  email: string;
};

export type AccountSetupPageFormData = {
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: string;
  avatar: File | null;
  location: string;
  interests: string[];
};
