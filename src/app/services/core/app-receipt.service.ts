import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppReceipt } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class AppReceiptService {
  private baseUrl: string = `${environment.baseUrl}/receipts`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppReceipt[]>(this.baseUrl, {
      params,
      context,
      observe: 'response',
    });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppReceipt>(`${this.baseUrl}/${hashId}`);
  }

  /**
   * The PDF is always served as bytes, never as a redirect, so the UI can
   * preview or download it from a blob. `documentPath` is not used here.
   */
  findDocument(hashId: string) {
    return this.http.get(`${this.baseUrl}/${hashId}/document`, { responseType: 'blob' });
  }

  /** Stamps `printedAt`. It does not return the PDF. */
  markAsPrinted(hashId: string) {
    return this.http.post<AppReceipt>(`${this.baseUrl}/${hashId}/print`, {});
  }
}
