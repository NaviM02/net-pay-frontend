import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppPermission, AppRole, RoleRequest, UserAccess, UserRoleAssignment, UserRoleRequest } from '../../model/access-control.model';
import { getHomeRoute, hasPermission } from '../../commons/utils/access.utils';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private baseUrl = environment.baseUrl;
  private accessSubject = new BehaviorSubject<UserAccess | null>(null);
  readonly access$ = this.accessSubject.asObservable();
  private inFlightAccess$?: Observable<UserAccess>;
  private sessionVersion = 0;

  constructor(private http: HttpClient, private queryParamService: QueryParamService) {}

  loadAccess(refresh = false): Observable<UserAccess> {
    const cached = this.accessSubject.value;
    if (!refresh && cached) return of(cached);
    if (!this.inFlightAccess$) {
      const sessionVersion = this.sessionVersion;
      this.inFlightAccess$ = this.http.get<UserAccess>(`${this.baseUrl}/auth/access`, {
        context: buildSkipGlobalLoadingContext(),
      }).pipe(
        tap({
          next: access => {
            if (sessionVersion === this.sessionVersion) this.accessSubject.next(access);
          },
          error: () => {
            if (sessionVersion === this.sessionVersion) this.accessSubject.next(null);
          },
        }),
        finalize(() => {
          if (sessionVersion === this.sessionVersion) this.inFlightAccess$ = undefined;
        }),
        shareReplay(1),
      );
    }
    return this.inFlightAccess$;
  }

  clear(): void {
    this.sessionVersion++;
    this.accessSubject.next(null);
    this.inFlightAccess$ = undefined;
  }

  hasPermission(required: string): boolean {
    return hasPermission(this.accessSubject.value?.permissions ?? [], required);
  }

  hasAnyPermission(required: string | string[]): boolean {
    return (typeof required === 'string' ? [required] : required).some(permission => this.hasPermission(permission));
  }

  getHomeRoute(): string {
    return getHomeRoute(this.accessSubject.value?.permissions ?? []);
  }

  permissions(): Observable<AppPermission[]> {
    return this.http.get<AppPermission[]>(`${this.baseUrl}/permissions`);
  }

  roles(queryParams: Map<string, string> = new Map()) {
    return this.http.get<AppRole[]>(`${this.baseUrl}/roles`, {
      params: this.queryParamService.getParams(queryParams), observe: 'response',
    });
  }

  role(hashId: string): Observable<AppRole> {
    return this.http.get<AppRole>(`${this.baseUrl}/roles/${hashId}`);
  }

  saveRole(hashId: string | null, request: RoleRequest): Observable<AppRole> {
    return hashId
      ? this.http.put<AppRole>(`${this.baseUrl}/roles/${hashId}`, request)
      : this.http.post<AppRole>(`${this.baseUrl}/roles`, request);
  }

  deleteRole(hashId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${hashId}`);
  }

  assignments(userHashId: string): Observable<UserRoleAssignment[]> {
    return this.http.get<UserRoleAssignment[]>(`${this.baseUrl}/users/${userHashId}/roles`);
  }

  assign(userHashId: string, request: UserRoleRequest): Observable<UserRoleAssignment> {
    return this.http.post<UserRoleAssignment>(`${this.baseUrl}/users/${userHashId}/roles`, request);
  }

  cancel(userHashId: string, assignmentHashId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userHashId}/roles/${assignmentHashId}`);
  }
}
