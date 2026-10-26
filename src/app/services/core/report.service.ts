import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CollectionsReport, OverdueClientReport } from '../../model/report.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private baseUrl: string = `${environment.baseUrl}/reports`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  /**
   * Collections of a period: totals by status plus the top collectors.
   *
   * Supported params: `fromDate`, `toDate` and `collectorLimit` (default 10).
   */
  findCollections(queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get<CollectionsReport>(`${this.baseUrl}/collections`, { params });
  }

  /**
   * Clients with expired and unpaid billing periods, ordered by debt.
   *
   * Supported params: `search`, `serviceHashId`, `status`, `offset` and `size`.
   */
  findOverdueClients(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<OverdueClientReport[]>(`${this.baseUrl}/overdue-clients`, {
      params,
      context,
      observe: 'response',
    });
  }

  /**
   * CSV/PDF of the collectors table, as a download (`Content-Disposition`).
   * Takes the same params as `findCollections` plus `format`.
   *
   * The global loading overlay is skipped on purpose: the page shows a busy
   * state on the export button while the document is generated.
   */
  exportCollections(queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get(`${this.baseUrl}/collections/export`, {
      params,
      context: buildSkipGlobalLoadingContext(),
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * CSV/PDF of the overdue table, as a download (`Content-Disposition`).
   * Takes the same params as `findOverdueClients` plus `format`, and always
   * returns every matching row: pagination is ignored.
   */
  exportOverdueClients(queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get(`${this.baseUrl}/overdue-clients/export`, {
      params,
      context: buildSkipGlobalLoadingContext(),
      responseType: 'blob',
      observe: 'response',
    });
  }
}