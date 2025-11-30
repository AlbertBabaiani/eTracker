import { Routes } from '@angular/router';
import { Signin } from './components/signin/signin';
import { Signup } from './components/signup/signup';
import { ResetPassword } from './components/reset-password/reset-password';

export const AUTH_ROUTES: Routes = [
  { path: 'signin', component: Signin },
  { path: 'signup', component: Signup },
  { path: 'reset-password', component: ResetPassword },
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
];
