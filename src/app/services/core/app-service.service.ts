import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppService } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class AppServiceService {
  private baseUrl: string = `${environment.baseUrl}/services`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppService[]>(this.baseUrl, {
      params,
      context,
      observe: 'response',
    });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppService>(`${this.baseUrl}/${hashId}`);
  }

  save(service: AppService) {
    if (service.hashId) {
      return this.http.put(`${this.baseUrl}/${service.hashId}`, service);
    }

    return this.http.post(this.baseUrl, service);
  }

  delete(hashId: string) {
    return this.http.delete(`${this.baseUrl}/${hashId}`);
  }
}
