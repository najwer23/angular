import { createFeatureSelector, createSelector } from "@ngrx/store";
import { State } from "./store.reducer";

export const selectUserState = createFeatureSelector<State>("user");

export const selectCurrentUser = createSelector(selectUserState, (state) => state?.currentUser ?? null);

export const selectFavoriteUsers = createSelector(selectUserState, (state) => state?.favoriteUsers ?? []);
