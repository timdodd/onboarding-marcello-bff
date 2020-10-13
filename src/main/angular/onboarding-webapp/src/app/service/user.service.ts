import {Injectable} from '@angular/core';
import {UserModel} from "../model/user.model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

const BASE_URL = "./api/v1/users";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  findAll(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(BASE_URL);
  }

  save(user: UserModel): Observable<UserModel> {
    if (user.userId) {
      return this.http.put<UserModel>(`${BASE_URL}/${user.userId}`, user);
    }
    return this.http.post<UserModel>(BASE_URL, user);
  }

  get(userId: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${BASE_URL}/${userId}`);
  }
}
