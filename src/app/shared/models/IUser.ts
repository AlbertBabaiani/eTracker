import { FormControl } from '@angular/forms';

export interface IUser {
  // Security
  uid: string;
  ip: string;
  lat: string;
  long: string;
  location: string;
  createdAt: string;

  // emailVerified: boolean;

  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  phone: string;

  properties: string[];
}

export interface signUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
}

// Fields

export interface UserPersonalFormFields {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  displayName: FormControl<string>;
  phone: FormControl<string>;
}

export interface UserAccountFormFields {
  email: FormControl<string>;
  password: FormControl<string>;
  repeatPassword?: FormControl<string>;
}
