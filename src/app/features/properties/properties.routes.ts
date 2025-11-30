import { Routes } from '@angular/router';
import { PropertyList } from './components/property-list/property-list';
import { canLeaveGuard } from './guards/can-leave-guard';

export const PROPERTIES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PropertyList,
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/edit-property/edit-property').then((c) => c.EditProperty),
    canDeactivate: [canLeaveGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/preview-property/preview-property').then((c) => c.PreviewProperty),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/edit-property/edit-property').then((c) => c.EditProperty),
    canDeactivate: [canLeaveGuard],
  },
];
