import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppClient, AppClientAccount, AppClientCharge } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class AppClientService {
  private baseUrl: string = `${environment.baseUrl}/clients`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppClient[]>(this.baseUrl, { params, context, observe: 'response', });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppClient>(`${this.baseUrl}/${hashId}`);
  }

  save(client: AppClient) {
    if (client.hashId) return this.http.put<AppClient>(`${this.baseUrl}/${client.hashId}`, client,);
    return this.http.post<AppClient>(this.baseUrl, client);
  }

  /** Month by month statement, the status is derived server-side. */
  findChargesByHashId(hashId: string) {
    return this.http.get<AppClientCharge[]>(`${this.baseUrl}/${hashId}/charges`);
  }

  /** Totals, balance, credit and overdue months. */
  findAccountByHashId(hashId: string) {
    return this.http.get<AppClientAccount>(`${this.baseUrl}/${hashId}/account`);
  }

  assignCollector(hashId: string, collectorId: number) {
    return this.http.put<AppClient>(`${this.baseUrl}/${hashId}/collector`, { collectorId },);
  }

  delete(hashId: string) {
    return this.http.delete(`${this.baseUrl}/${hashId}`);
  }
}
