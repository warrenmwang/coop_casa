import {
  APICommunityReceivedSchema,
  APIFileReceivedSchema,
  APIOrderedFileSchema,
  APIPropertyReceivedSchema,
  APIReceivedUserProfileImagesSchema,
  APIUserProfileReceivedSchema,
  APIUserReceivedSchema,
  AccountSetupPageFormDataSchema,
  CommunityDetailsSchema,
  CommunitySchema,
  OrderedFileSchema,
  PropertyDetailsSchema,
  PropertySchema,
  PublicListerBasicInfoSchema,
  UserDetailsSchema,
  UserProfileDetailsSchema,
  UserProfileSchema,
  UserSchema,
  UserStatusSchema,
  UserStatusSchemaTimeStamped,
} from "@app/types/Schema";
import { z } from "zod";

export type User = z.infer<typeof UserSchema>;

export type APIUserReceived = z.infer<typeof APIUserReceivedSchema>;

export type APIFileReceived = z.infer<typeof APIFileReceivedSchema>;

export type UserDetails = z.infer<typeof UserDetailsSchema>;

export type PublicListerBasicInfo = z.infer<typeof PublicListerBasicInfoSchema>;

export type AccountSetupPageFormData = z.infer<
  typeof AccountSetupPageFormDataSchema
>;

export type PropertyDetails = z.infer<typeof PropertyDetailsSchema>;

export type FormPropertyDetails = {
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
  squareFeet: string;
  numBedrooms: string;
  numToilets: string;
  numShowersBaths: string;
  costDollars: string;
  costCents: string;
  miscNote: string;
};

export type APIOrderedFile = z.infer<typeof APIOrderedFileSchema>;

export type APIPropertyReceived = z.infer<typeof APIPropertyReceivedSchema>;

export type OrderedFile = z.infer<typeof OrderedFileSchema>;

export type Property = z.infer<typeof PropertySchema>;

export type ErrorBody = {
  error: string;
};

export type CommunityDetails = z.infer<typeof CommunityDetailsSchema>;

export type APICommunityReceived = z.infer<typeof APICommunityReceivedSchema>;

export type Community = z.infer<typeof CommunitySchema>;

export type UserProfileDetails = z.infer<typeof UserProfileDetailsSchema>;

export type APIUserProfileReceived = z.infer<
  typeof APIUserProfileReceivedSchema
>;

export type UserProfile = z.infer<typeof UserProfileSchema>;

export type APIReceivedUserProfileImages = z.infer<
  typeof APIReceivedUserProfileImagesSchema
>;

export type UserStatusTimeStamped = z.infer<typeof UserStatusSchemaTimeStamped>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
