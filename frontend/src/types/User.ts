
export type MaybeUser = User | undefined

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  location: string;
  interests: string;
  avatar: string;
}