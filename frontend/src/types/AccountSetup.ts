type avatarType = File | null

export interface AccountSetupPageFormData {
  firstName : string,
  lastName: string,
  birthdate: string,
  gender: string,
  avatar: avatarType,
  location: string,
  interests: string[]
}