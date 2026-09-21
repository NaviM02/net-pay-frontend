import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  private baseUrl: string = `${environment.baseUrl}/users`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findMe() {
    return this.http.get<AppUser>(`${this.baseUrl}/me`);
  }

  findAll(queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get<AppUser[]>(this.baseUrl, { params, observe: 'response' });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppUser>(`${this.baseUrl}/${hashId}`);
  }

  save(user: AppUser) {
    if (user.hashId) return this.http.put(`${this.baseUrl}/${user.hashId}`, user);
    return this.http.post(this.baseUrl, user);
  }

  delete(hashId: string) {
    return this.http.delete(`${this.baseUrl}/${hashId}`);
  }
}
