import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard-guard';
import { wildcardGuard } from './core/guards/wild-card-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'feature',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  {
    path: 'feature',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((c) => c.MainLayout),

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'calendar',
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/users/users.routes').then((r) => r.USERS_ROUTES),
      },
      {
        path: 'properties',
        loadChildren: () =>
          import('./features/properties/properties.routes').then((r) => r.PROPERTIES_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/reservation/reservations.routes').then((r) => r.RESERVATIONS_ROUTES),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
      },
    ],
  },
  {
    path: '**',
    canActivate: [wildcardGuard],
    loadComponent: () => import('./features/auth/components/signin/signin').then((c) => c.Signin),
  },
];
