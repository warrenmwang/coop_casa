type avatarType = File | null

export interface AccountSetupPageFormData {
  firstName : string,
  lastName: string,
  birthdate: string,
  avatar: avatarType,
  location: string,
  interests: string[]
}