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

// --------

export type PropertyDetails = {
  propertyId: string;
  listerUserId: string;
  name: string;
  description: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  squareFeet: number;
  numBedrooms: number;
  numToilets: number;
  numShowersBaths: number;
  costDollars: number;
  costCents: number;
  miscNote: string;
};

export type APIOrderedFile = {
  orderNum: number;
  file: APIFileReceived;
};

export type APIPropertyReceived = {
  details: PropertyDetails;
  images: APIOrderedFile[];
};

export type OrderedFile = {
  orderNum: number;
  file: File;
};

export type Property = {
  details: PropertyDetails;
  images: OrderedFile[];
};

export type ErrorBody = {
  error: string;
};
