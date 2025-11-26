import { createSelector, createFeatureSelector } from '@ngrx/store';
import {State} from './store.reducer'

export const selectCounterState = createFeatureSelector<State>('user');

export const selectCurrentUser = createSelector(
  selectCounterState,
  (state) => state.currentUser
);

export const selectFavoriteUsers = createSelector(
  selectCounterState,
  (state) => state.favoriteUsers
);

