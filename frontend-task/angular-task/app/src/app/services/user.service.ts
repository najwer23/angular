import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, type Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private apiURL = "http://localhost:9333/users";

	constructor(private http: HttpClient) {}

	getUsers(
		filter?: string,
		page?: number,
		pageSize?: number,
		sort?: string,
	): Observable<any> {
		let url = `${this.apiURL}?`;
		if (filter) url += `filter=${filter}&`;
		if (page) url += `page=${page}&`;
		if (pageSize) url += `pageSize=${pageSize}&`;
		if (sort) url += `sort=${sort}&`;
		return this.http.get(url).pipe(map((res: any) => res.results));
	}

	getUser(id: string) {
		return this.http.get(`${this.apiURL}/${id}`);
	}
}
