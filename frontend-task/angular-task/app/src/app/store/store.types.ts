export type UserModel = {
  id: number;
  name: string;
  role: string;
  email: string;
  protectedProjects: number;
  favorite: boolean;
};

export interface State {
  currentUser: UserModel | null;
  favoriteUsers: UserModel[];
}

export const initialState: State = {
  currentUser: null,
  favoriteUsers: [],
};