import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard-guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/users/users.routes').then((r) => r.USERS_ROUTES),
  },
  {
    path: 'properties',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/properties/properties.routes').then((r) => r.PROPERTIES_ROUTES),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/reservation/reservations.routes').then((r) => r.RESERVATIONS_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
  },

  {
    path: '**',
    redirectTo: 'properties',
    pathMatch: 'full',
  },
];
