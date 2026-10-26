import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { AppToken, AuthRequestDto, TwoFactorVerifyRequest } from '../../model/app.model';
import { map, of, switchMap, tap } from 'rxjs';
import { CurrentUserService } from './current-user.service';
import { AppStorageKeys } from '../../model/app-storage-keys.enum';
import { AppUserService } from './app-user.service';
import { AccessControlService } from './access-control.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private baseUrl: string = `${environment.baseUrl}/auth`;
  private fingerprint: string = 'foo';

  constructor(
    private http: HttpClient,
    private currentClientService: CurrentUserService,
    private userService: AppUserService,
    private accessService: AccessControlService,
  ) {
    // Initialize FingerprintJS and get the visitor identifier.
    FingerprintJS.load()
      .then(fp => fp.get())
      .then(res => this.fingerprint = res.visitorId);
  }

  doLogin(authReq: AuthRequestDto) {
    authReq = { ...authReq, fingerprint: this.fingerprint };
    return this.http.post<AppToken>(`${this.baseUrl}/login`, authReq).pipe(
      switchMap(response => response.twoFactorRequired
        ? of(response)
        : this.completeLogin(response).pipe(map(() => response))),
    );
  }

  verifyTwoFactor(challengeId: string, code: string) {
    const request: TwoFactorVerifyRequest = { challengeId, code };
    return this.http.post<AppToken>(`${this.baseUrl}/2fa/verify`, request).pipe(
      switchMap(response => this.completeLogin(response).pipe(map(() => response))),
    );
  }

  private completeLogin(response: AppToken) {
    this.accessService.clear();
    this.storeToken(response.authc);
    return this.userService.findMe().pipe(
      tap(user => this.currentClientService.updateCurrentUser(user)),
      switchMap(() => this.accessService.loadAccess(true)),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(AppStorageKeys.AUTH);
  }

  private storeToken(token: string) {
    localStorage.setItem(AppStorageKeys.AUTH, token);
  }
}
