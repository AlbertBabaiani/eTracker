import { Routes } from '@angular/router';
import { Profile } from './components/profile/profile';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: Profile,
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('./components/edit-profile/edit-profile').then((c) => c.EditProfile),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];
