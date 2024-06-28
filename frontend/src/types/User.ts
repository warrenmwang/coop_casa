export type NullUser = User | null;

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

export interface ListerBasicInfo {
  firstName: string;
  lastName: string;
  email: string;
}
