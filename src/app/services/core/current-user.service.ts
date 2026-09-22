import { Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { AppUser } from '../../model/app.model';
import { ToastService } from '../other/toast.service';
import { Router } from '@angular/router';
import { AppStorageKeys } from '../../model/app-storage-keys.enum';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppUserService } from './app-user.service';
import { TypologyEnum } from '../../model/typology.enum';
import { getHomeRouteForRole } from '../../commons/utils/role.utils';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private cachedUser?: AppUser;
  private inFlightCurrentUser$?: Observable<AppUser>;

  constructor(
    private clientMeService: AppUserService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  getCurrentUser(): Observable<AppUser> {
    const cached = this.currentUser();
    if (cached) {
      this.cachedUser = cached;
      return of(cached);
    }

    if (!this.inFlightCurrentUser$) {
      this.inFlightCurrentUser$ = this.clientMeService.findMe().pipe(
        tap({
          next: (user) => this.updateCurrentUser(user),
          error: (_) => {
            this.toastService.error('msg_error_server');
            this.logout();
          },
        }),
        finalize(() => {
          this.inFlightCurrentUser$ = undefined;
        }),
        shareReplay(1),
      );
    }

    return this.inFlightCurrentUser$;
  }

  updateCurrentUser(currentUser: AppUser) {
    this.cachedUser = currentUser;
    localStorage.setItem(AppStorageKeys.PROFILE, JSON.stringify(currentUser));
  }

  isAuthenticated(): boolean {
    const authToken = localStorage.getItem(AppStorageKeys.AUTH);
    if (!authToken) return false;

    const helper = new JwtHelperService();
    return !helper.isTokenExpired(authToken);
  }

  /**
   * `internalId` of the role of the cached user, or `undefined` while the
   * profile has not been loaded yet. Always read it through `getCurrentUser()`
   * when the value is needed to build something; only the helpers below may
   * rely on the synchronous cache.
   */
  get role(): number | undefined {
    return this.currentUser()?.tpRole?.internalId;
  }

  hasRole(role: TypologyEnum): boolean {
    const current = this.role;
    return current !== undefined && current === role;
  }

/** `hashId` of the cached user, or `undefined` while the profile is unknown. */
getCurrentHashId(): string | undefined {
    return this.currentUser()?.hashId;
  }

  /** Numeric internal id of the cached user, used by the endpoints that take ids. */
getCurrentId(): number | undefined {
  return this.currentUser()?.id;
}

  /**
   * First page of the current role. Reads the profile from `localStorage` when
   * it is not in memory yet, and falls back to the not-found route while the
   * role is still unknown.
   */
  getHomeRoute(): string {
    return getHomeRouteForRole(this.currentUser()?.tpRole?.internalId);
  }

  logout() {
    localStorage.clear();
    this.cachedUser = undefined;
    this.inFlightCurrentUser$ = undefined;
    if (this.router.url !== '/') void this.router.navigate(['/']);
  }

  /** Synchronous snapshot of the profile: memory first, then `localStorage`. */
  private currentUser(): AppUser | undefined {
    if (this.cachedUser) return this.cachedUser;

    const jsonData = localStorage.getItem(AppStorageKeys.PROFILE);
    if (!jsonData) return undefined;

    try {
      return JSON.parse(jsonData) as AppUser;
    } catch {
      return undefined;
    }
  }
}
