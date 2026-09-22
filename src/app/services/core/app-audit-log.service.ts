import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppAuditLog } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class AppAuditLogService {
  private baseUrl: string = `${environment.baseUrl}/audit-logs`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppAuditLog[]>(this.baseUrl, {
      params,
      context,
      observe: 'response',
    });
  }

  /** History of a single record, newest first. Empty array when there is none. */
  findByEntity(entityType: string, entityHashId: string) {
    return this.http.get<AppAuditLog[]>(`${this.baseUrl}/entity/${entityType}/${entityHashId}`);
  }
}
