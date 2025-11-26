import { createAction, props } from '@ngrx/store';
import { UserModel } from 'app/user-list/user-list.component';

export const setCurrentUser = createAction(
  '[User] Set current user',
  props<{ user: UserModel }>()
);

export const addUserToFavorite = createAction(
  '[User] Add user to favorite',
  props<{ user: UserModel }>()
);

export const removeUserFromFavorite = createAction(
  '[User] Remove user from favorite', 
  props<{ user: UserModel }>()
);
