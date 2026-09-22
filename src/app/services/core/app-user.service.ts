import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppClient, AppUser } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

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

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppUser[]>(this.baseUrl, { params, context, observe: 'response' });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppUser>(`${this.baseUrl}/${hashId}`);
  }

  /**
   * Clients assigned to a collector, server-paginated.
   * Only receives the pagination params because this endpoint has no filters yet.
   */
  findByCollectorHashId(hashId: string, size: number, offset: number) {
    const params = new HttpParams().set('size', `${size}`).set('offset', `${offset}`);
    return this.http.get<AppClient[]>(`${this.baseUrl}/${hashId}/clients`, { params, observe: 'response' });
  }

  save(user: AppUser) {
    if (user.hashId) return this.http.put(`${this.baseUrl}/${user.hashId}`, user);
    return this.http.post(this.baseUrl, user);
  }

  delete(hashId: string) {
    return this.http.delete(`${this.baseUrl}/${hashId}`);
  }
}
