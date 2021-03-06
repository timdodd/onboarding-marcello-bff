import {Injectable} from '@angular/core';
import {PhoneModel} from "../model/phone.model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {PhoneVerificationModel} from "../model/phoneVerification.model";

const BASE_URL = "./api/v1/users";

@Injectable({
  providedIn: 'root'
})
export class PhoneService {

  constructor(private http: HttpClient) {
  }

  findUserPhones(userId: string): Observable<PhoneModel[]> {
    return this.http.get<PhoneModel[]>(`${BASE_URL}/${userId}/phones`);
  }

  get(phoneId: string, userId: string): Observable<PhoneModel[]> {
    return this.http.get<PhoneModel[]>(`${BASE_URL}/${userId}/phones/${phoneId}`);
  }

  save(phone: PhoneModel, userId: string): Observable<PhoneModel> {
      if (phone.phoneId) {
        return this.http.put<PhoneModel>(`${BASE_URL}/${userId}/phones/${phone.phoneId}`, phone);
      }
      return this.http.post<PhoneModel>(`${BASE_URL}/${userId}/phones`, phone);
  }

  makePrimary(phone: PhoneModel): Observable<PhoneModel> {
    return this.http.put<PhoneModel>(`${BASE_URL}/${phone.userId}/phones/makePrimary/${phone.phoneId}`, phone);
  }

  delete(phone: PhoneModel): Observable<Response> {
      return this.http.delete<Response>(`${BASE_URL}/${phone.userId}/phones/${phone.phoneId}`);
  }

  sendVerification(phone: PhoneModel): Observable<Response> {
    return this.http.post<Response>(`${BASE_URL}/${phone.userId}/phones/${phone.phoneId}/sendVerification`, null);
  }

  verify(phone: PhoneModel, phoneVerification: PhoneVerificationModel): Observable<Response> {
    return this.http.post<Response>(`${BASE_URL}/${phone.userId}/phones/${phone.phoneId}/verify`, phoneVerification);
  }

}
