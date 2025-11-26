export interface UserModel {
  id: number;
  name: string;
  role: string;
  email: string;
  protectedProjects: number;
  fav: boolean;
}

export interface State {
  currentUser: UserModel | null;
  favoriteUsers: UserModel[];
}

export const initialState: State = {
  currentUser: null,
  favoriteUsers: [],
};