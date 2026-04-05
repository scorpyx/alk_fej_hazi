import { Routes } from '@angular/router';
import {Home} from './home/home';
import {Reservation} from './reservation/reservation'

export const routes: Routes = [{
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'reservation/:id',
    component: Reservation,
    title: 'Reserve page',
  }
];
