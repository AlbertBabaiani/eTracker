import { Routes } from '@angular/router';
import { Calendar } from './components/calendar/calendar';
export const RESERVATIONS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Calendar,
  },
];
