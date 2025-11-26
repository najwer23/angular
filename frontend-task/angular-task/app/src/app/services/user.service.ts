import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

interface ApiUserModel {
  id: number;
  name: string;
  role: string;
  email: string;
  protectedProjects: number;
}

interface ApiUsersResponse {
  results: ApiUserModel[];
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiURL = "http://localhost:9333/users";

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiUserModel[]> {
    return this.http.get<ApiUsersResponse>(this.apiURL).pipe(
      map(res => res.results)
    );
  }

  getUser(id: string): Observable<ApiUserModel> {
    return this.http.get<ApiUserModel>(`${this.apiURL}/${id}`);
  }
}
