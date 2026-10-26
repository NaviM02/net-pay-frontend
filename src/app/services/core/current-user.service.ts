import { Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { AppUser } from '../../model/app.model';
import { ToastService } from '../other/toast.service';
import { Router } from '@angular/router';
import { AppStorageKeys } from '../../model/app-storage-keys.enum';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppUserService } from './app-user.service';
import { AccessControlService } from './access-control.service';

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
    private accessService: AccessControlService,
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

  /** Public identifier; users/me no longer exposes a numeric id. */
  getCurrentHashId(): string | undefined {
    return this.currentUser()?.hashId;
  }

  /** Legacy collector filters still accept the userId claim from the session token. */
  getCurrentId(): number | undefined {
    const token = localStorage.getItem(AppStorageKeys.AUTH);
    if (!token) return undefined;
    try {
      const claims = new JwtHelperService().decodeToken<{ userId?: number }>(token);
      return typeof claims?.userId === 'number' ? claims.userId : undefined;
    } catch {
      return undefined;
    }
  }

  /** First accessible page according to the effective permissions from the API. */
  getHomeRoute(): string {
    return this.accessService.getHomeRoute();
  }

  logout() {
    this.accessService.clear();
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
