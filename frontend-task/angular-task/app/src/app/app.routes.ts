import { Routes } from '@angular/router';
import {UserComponent} from './user/user.component'
import {UserListComponent} from './user-list/user-list.component'

export const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
  },
  {
    path: ':id',
    component: UserComponent,
  }
];
