import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppClient, AppUser, ChangePasswordRequest, ForgotPasswordRequest, MessageResponseDto, ResetPasswordRequest, ResetTokenValidationDto } from '../../model/app.model';
import { QueryParamService } from '../other/query-param.service';
import { buildSkipGlobalLoadingContext } from '../../interceptors/loading-ui-context';

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  private baseUrl: string = `${environment.baseUrl}/users`;

  constructor(
    private http: HttpClient,
    private queryParamService: QueryParamService,
  ) {}

  findMe() {
    return this.http.get<AppUser>(`${this.baseUrl}/me`);
  }

  findAll(queryParams: Map<string, string> = new Map(), skipLoading: boolean = false) {
    const params = this.queryParamService.getParams(queryParams);
    const context = skipLoading ? buildSkipGlobalLoadingContext() : undefined;
    return this.http.get<AppUser[]>(this.baseUrl, { params, context, observe: 'response' });
  }

  findByHashId(hashId: string) {
    return this.http.get<AppUser>(`${this.baseUrl}/${hashId}`);
  }

  /**
   * Asks for the reset link. It answers `200` whether or not the email is
   * registered, so the UI must never confirm that an account exists. A `400`
   * only comes back when the email does exist but the delivery failed.
   */
  forgotPassword(email: string) {
    return this.http.post<MessageResponseDto>(`${this.baseUrl}/forgot-password`, {
      email,
    } satisfies ForgotPasswordRequest);
  }

  /** Tells whether a reset token still exists, has not been used and has not expired. */
  validateResetToken(token: string) {
    const params = new HttpParams().set('token', token);
    return this.http.get<ResetTokenValidationDto>(`${this.baseUrl}/reset-password/validate`, { params });
  }

  /** Sets the new password. The token is single use and is consumed on success. */
  resetPassword(request: ResetPasswordRequest) {
    return this.http.post<MessageResponseDto>(`${this.baseUrl}/reset-password`, request);
  }

  changePassword(hashId: string | null, request: ChangePasswordRequest) {
    const endpoint = hashId
      ? `${this.baseUrl}/${hashId}/password`
      : `${this.baseUrl}/me/password`;
    return this.http.put<MessageResponseDto>(endpoint, request);
  }

  /**
   * Clients assigned to a user, server-paginated.
   * `hashId` is always the current user, never a value typed in the
   * UI. The endpoint reads the same query params as `/api/clients`.
   */
  findClientsByUserHashId(hashId: string, queryParams: Map<string, string> = new Map()) {
    const params = this.queryParamService.getParams(queryParams);
    return this.http.get<AppClient[]>(`${this.baseUrl}/${hashId}/clients`, { params, observe: 'response' });
  }

  save(user: AppUser) {
    const request = {
      fullName: user.fullName,
      email: user.email,
      password: user.password || null,
      status: user.tpStatus.internalId,
      twoFactorEnabled: user.twoFactorEnabled,
    };
    if (user.hashId) return this.http.put<AppUser>(`${this.baseUrl}/${user.hashId}`, request);
    return this.http.post<AppUser>(this.baseUrl, request);
  }

  updateMe(user: Pick<AppUser, 'fullName' | 'email' | 'twoFactorEnabled'>) {
    return this.http.put<AppUser>(`${this.baseUrl}/me`, user);
  }

  delete(hashId: string) {
    return this.http.delete(`${this.baseUrl}/${hashId}`);
  }
}
