import { createReducer, on } from "@ngrx/store";
import { addUserToFavorite, removeUserFromFavorite, setCurrentUser } from "./store.actions";
import { initialState } from "./store.types";

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
  })),
);
