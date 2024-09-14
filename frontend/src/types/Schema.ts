import { z } from "zod";

export const APIFileReceivedSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(), // in bytes
  data: z.string().base64(), // base64 encoding of binary content of file
});

export const UserDetailsSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string().date(),
  gender: z.string(),
  location: z.string(),
  interests: z.array(z.string()),
});

export const UserSchema = UserDetailsSchema.extend({
  avatar: z.instanceof(File).nullable(),
});

export const APIUserReceivedSchema = z.object({
  userDetails: UserDetailsSchema,
  avatarImageB64: APIFileReceivedSchema,
});

export const ListerBasicInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

export const AccountSetupPageFormDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthdate: z.string().date(),
  gender: z.string(),
  avatar: z.instanceof(File).nullable(),
  location: z.string(),
  interests: z.array(z.string()),
});

export const PropertyDetailsSchema = z.object({
  propertyId: z.string().uuid(),
  listerUserId: z.string(),
  name: z.string(),
  description: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  country: z.string(),
  squareFeet: z.number(),
  numBedrooms: z.number(),
  numToilets: z.number(),
  numShowersBaths: z.number(),
  costDollars: z.number(),
  costCents: z.number(),
  miscNote: z.string(),
});

export const APIOrderedFileSchema = z.object({
  orderNum: z.number(),
  file: APIFileReceivedSchema,
});

export const APIPropertyReceivedSchema = z.object({
  details: PropertyDetailsSchema,
  images: z.array(APIOrderedFileSchema),
});

export const OrderedFileSchema = z.object({
  orderNum: z.number(),
  file: z.instanceof(File),
});

export const PropertySchema = z.object({
  details: PropertyDetailsSchema,
  images: z.array(OrderedFileSchema),
});

export const CommunityDetailsSchema = z.object({
  communityId: z.string().uuid(),
  adminUserId: z.string(),
  name: z.string(),
  description: z.string(),
});

export const APICommunityReceivedSchema = z.object({
  details: CommunityDetailsSchema,
  images: z.array(APIFileReceivedSchema),
  users: z.array(z.string()),
  properties: z.array(z.string().uuid()),
});

export const CommunitySchema = z.object({
  details: CommunityDetailsSchema,
  images: z.array(z.instanceof(File)),
  users: z.array(z.string()),
  properties: z.array(z.string().uuid()),
});

export const UserProfileDetailsSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  ageInYears: z.number(),
  gender: z.string(),
  location: z.string(),
  interests: z.array(z.string()),
});

export const APIUserProfileReceivedSchema = z.object({
  details: UserProfileDetailsSchema,
  images: z.array(APIFileReceivedSchema),
  communityIDs: z.array(z.string().uuid()),
  propertyIDs: z.array(z.string().uuid()),
});

export const UserProfileSchema = z.object({
  details: UserProfileDetailsSchema,
  images: z.array(z.instanceof(File)),
  communityIDs: z.array(z.string().uuid()),
  propertyIDs: z.array(z.string().uuid()),
});

export const FileArraySchema = z.array(z.instanceof(File));

export const APIReceivedUserProfileImagesSchema = z.object({
  images: z.array(APIFileReceivedSchema),
});

export const APIReceivedPropertyIDsSchema = z.object({
  propertyIDs: z.array(z.string().uuid()),
});

export const APIReceivedCommunityIDsSchema = z.object({
  communityIDs: z.array(z.string().uuid()),
});

export const APIReceivedUserIDsSchema = z.object({
  userIDs: z.array(z.string().min(1)),
});
