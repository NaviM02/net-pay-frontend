import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MyDashboard, OperationsDashboard } from '../../model/dashboard.model';
import { QueryParamService } from '../other/query-param.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl: string = `${environment.baseUrl}/dashboard`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  /**
   * Global dashboard: summary, recent payments and activities, distribution by
   * plan and collections by payment method.
   *
   * Supported params: `year`, `month`, `recentLimit` (default 5) and `months`
   * (default 6).
   */
  findOverview(queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get<OperationsDashboard>(this.baseUrl, { params });
  }

  /**
   * Personal dashboard of the authenticated user: no global activities and no client
   * distribution by plan. Takes the same params as `findOverview`.
   */
  findMyDashboard(queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get<MyDashboard>(`${this.baseUrl}/collector`, { params });
  }
}
