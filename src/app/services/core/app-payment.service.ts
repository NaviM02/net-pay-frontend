import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppPayment } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class AppPaymentService {
  private baseUrl: string = `${environment.baseUrl}/payments`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppPayment[]>(this.baseUrl, {
      params,
      context,
      observe: 'response',
    });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppPayment>(`${this.baseUrl}/${hashId}`);
  }

  save(payment: AppPayment) {
    if (payment.hashId) {
      return this.http.put<AppPayment>(`${this.baseUrl}/${payment.hashId}`, payment);
    }

    return this.http.post<AppPayment>(this.baseUrl, payment);
  }
}
