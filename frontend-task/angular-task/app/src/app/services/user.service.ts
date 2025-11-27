import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

interface ApiUserModel {
  id: number;
  name: string;
  role: string;
  email: string;
  protectedProjects: number;
}

export interface ApiUsersResponse {
  results: ApiUserModel[];
  total: number;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiURL = "http://localhost:9333/users";

  constructor(private http: HttpClient) {}

  getUsers(page: number, pageSize: number, params?: { filter?: string, sort?: string }) {
    let query = `?page=${page}&pageSize=${pageSize}`;
    if (params?.filter) query += `&filter=${params.filter}`;
    if (params?.sort) query += `&sort=${params.sort}`;
    return this.http.get<ApiUsersResponse>(`${this.apiURL}${query}`);
  }

  getUser(id: string): Observable<ApiUserModel> {
    return this.http.get<ApiUserModel>(`${this.apiURL}/${id}`);
  }
}
