export interface IUser {
  // Security
  uid: string;
  ip: string;
  lat: string;
  long: string;
  location: string;
  createdAt: string;

  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;

  properties: string[];
}
