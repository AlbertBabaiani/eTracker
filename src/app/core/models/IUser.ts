export interface IUser {
  // Security
  uid: string;
  ip: string;
  lat: string;
  long: string;
  location: string;
  createdAt: string;

  emailVerified: boolean;

  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  phoneNumber: string;

  properties: string[];
}

export interface signUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
}
