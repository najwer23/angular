import { createReducer, on } from '@ngrx/store';
import {addUserToFavorite, removeUserFromFavorite, setCurrentUser} from './store.actions'
import {UserModel} from 'app/user-list/user-list.component'

export interface State {
  userAmount: number
  currentUser: UserModel
  favoriteUsers: any
}

export const initialState: State = {
  userAmount: 0,
  // @ts-ignore
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
    favoriteUsers: [...state.favoriteUsers, user]
  })),
  on(removeUserFromFavorite, (state, { user }) => ({
    ...state,
    // @ts-ignore
    favoriteUsers: state.favoriteUsers.filter((u) => u.id !== u.id)
  }))
);
