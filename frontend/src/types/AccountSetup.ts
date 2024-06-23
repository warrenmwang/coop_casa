export type AvatarType = File | null;

export interface AccountSetupPageFormData {
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: string;
  avatar: AvatarType;
  location: string;
  interests: string[];
}
