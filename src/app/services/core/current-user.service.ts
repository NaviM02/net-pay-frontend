import { Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { AppUser } from '../../model/app.model';
import { ToastService } from '../other/toast.service';
import { Router } from '@angular/router';
import { AppStorageKeys } from '../../model/app-storage-keys.enum';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppUserService } from './app-user.service';

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
    if (this.cachedUser) return of(this.cachedUser);

    const jsonData = localStorage.getItem(AppStorageKeys.PROFILE);
    if (jsonData) {
      this.cachedUser = JSON.parse(jsonData) as AppUser;
      return of(this.cachedUser);
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

  logout() {
    localStorage.clear();
    this.cachedUser = undefined;
    this.inFlightCurrentUser$ = undefined;
    if (this.router.url !== '/') void this.router.navigate(['/']);
  }
}
