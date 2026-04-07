import { Routes } from '@angular/router';
import { Home } from './home/home';
import {Reservation} from './reservation/reservation'
import { Reserved } from './reserved/reserved';
import { Cancelled } from './cancelled/cancelled';

export const routes: Routes = [{
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'reservation/:id',
    component: Reservation,
    title: 'Reserve page',
  },
  {
    path: 'reservation/:id/success',
    component: Reserved,
    title: 'Successful reservation',
  },
  {
    path: 'reservation/:id/cancelled',
    component: Cancelled,
    title: 'Reservation cancelled',
  }
];
