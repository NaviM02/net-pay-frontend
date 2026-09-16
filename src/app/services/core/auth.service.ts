import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { AppToken, AuthRequestDto } from '../../model/app.model';
import { switchMap, tap } from 'rxjs';
import { CurrentUserService } from './current-user.service';
import { AppStorageKeys } from '../../model/app-storage-keys.enum';
import { AppUserService } from './app-user.service';

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
  ) {
    // Initialize FingerprintJS and get the visitor identifier.
    FingerprintJS.load()
      .then(fp => fp.get())
      .then(res => this.fingerprint = res.visitorId);
  }

  doLogin(authReq: AuthRequestDto) {
    authReq = { ...authReq, fingerprint: this.fingerprint };
    return this.http.post<AppToken>(`${this.baseUrl}/login`, authReq)
      .pipe(
        tap(token => this.storeToken(token.authc)),
        switchMap(_ => this.userService.findMe()
          .pipe(tap(client => this.currentClientService.updateCurrentUser(client)))
        )
      );
  }

  getToken(): string | null {
    return localStorage.getItem(AppStorageKeys.AUTH);
  }

  private storeToken(token: string) {
    localStorage.setItem(AppStorageKeys.AUTH, token);
  }
}
