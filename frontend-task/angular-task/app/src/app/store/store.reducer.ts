import { createReducer, on } from '@ngrx/store';
import {
  addUserToFavorite,
  removeUserFromFavorite,
  setCurrentUser,
} from './store.actions';
import { UserModel } from 'app/user-list/user-list.component';

export interface State {
  currentUser: UserModel | null;
  favoriteUsers: UserModel[];
}

export const initialState: State = {
  currentUser: null,
  favoriteUsers: [],
};

export const userReducer = createReducer(
  initialState,
  on(setCurrentUser, (state, { user }) => ({
    ...state,
    currentUser: user,
  })),
  on(addUserToFavorite, (state, { user }) => ({
    ...state,
    favoriteUsers: [...state.favoriteUsers, user],
  })),
  on(removeUserFromFavorite, (state, { user }) => ({
    ...state,
    favoriteUsers: state.favoriteUsers.filter((u) => u.id !== user.id),
  }))
);
