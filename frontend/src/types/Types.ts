import { z } from "zod";
import {
  AccountSetupPageFormDataSchema,
  APICommunityReceivedSchema,
  APIFileReceivedSchema,
  APIOrderedFileSchema,
  APIPropertyReceivedSchema,
  APIReceivedUserProfileImagesSchema,
  APIUserProfileReceivedSchema,
  APIUserReceivedSchema,
  CommunityDetailsSchema,
  CommunitySchema,
  PublicListerBasicInfoSchema,
  OrderedFileSchema,
  PropertyDetailsSchema,
  PropertySchema,
  UserDetailsSchema,
  UserProfileDetailsSchema,
  UserProfileSchema,
  UserSchema,
} from "./Schema";

export type User = z.infer<typeof UserSchema>;

export type APIUserReceived = z.infer<typeof APIUserReceivedSchema>;

export type APIFileReceived = z.infer<typeof APIFileReceivedSchema>;

export type UserDetails = z.infer<typeof UserDetailsSchema>;

export type PublicListerBasicInfo = z.infer<typeof PublicListerBasicInfoSchema>;

export type AccountSetupPageFormData = z.infer<
  typeof AccountSetupPageFormDataSchema
>;

export type PropertyDetails = z.infer<typeof PropertyDetailsSchema>;

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
