import { Injectable } from '@angular/core';

export interface UserListState {
  pageIndex: number;
  pageSize: number;
  sortActive: string;
  sortDirection: 'asc' | 'desc' | '';
  filterValue: string;
  favoriteUserIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly USER_LIST_STATE_KEY = 'userListState';

  setUserListState(state: UserListState): void {
    sessionStorage.setItem(this.USER_LIST_STATE_KEY, JSON.stringify(state));
  }

  getUserListState(): UserListState | null {
    const item = sessionStorage.getItem(this.USER_LIST_STATE_KEY);
    return item ? JSON.parse(item) as UserListState : null;
  }

  removeUserListState(): void {
    sessionStorage.removeItem(this.USER_LIST_STATE_KEY);
  }

  isUserFavorite(userId: number): boolean {
    const state = this.getUserListState();
    return state?.favoriteUserIds.includes(userId) || false;
  }

  addUserToFavorites(userId: number): void {
    const state = this.getUserListState() || {
      pageIndex: 0,
      pageSize: 5,
      sortActive: '',
      sortDirection: '',
      filterValue: '',
      favoriteUserIds: []
    };
    
    if (!state.favoriteUserIds.includes(userId)) {
      state.favoriteUserIds.push(userId);
      this.setUserListState(state);
    }
  }

  removeUserFromFavorites(userId: number): void {
    const state = this.getUserListState();
    if (state) {
      const index = state.favoriteUserIds.indexOf(userId);
      if (index > -1) {
        state.favoriteUserIds.splice(index, 1);
        this.setUserListState(state);
      }
    }
  }
}
