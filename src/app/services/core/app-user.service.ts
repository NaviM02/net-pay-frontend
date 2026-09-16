import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../../model/app.model';

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  private baseUrl: string = `${environment.baseUrl}/users`;

  constructor(private http: HttpClient) {}

  findMe() {
    return this.http.get<AppUser>(`${this.baseUrl}/me`);
  }

  save(client: AppUser) {
    if (client.hashId) return this.http.put(`${this.baseUrl}/${client.hashId}`, client);
    return this.http.post(this.baseUrl, client);
  }
}
