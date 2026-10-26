import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AppUserService } from '../../../../services/core/app-user.service';
import { ToastService } from '../../../../services/other/toast.service';
import { InputForPasswordComponent } from '../../../../commons/components/input-for-password/input-for-password.component';
import { MaterialIconComponent } from '../../../../commons/components/material-icon/material-icon.component';

/**
 * Minimum length the backend accepts. It has to match
 * `PasswordResetUseCase.MIN_PASSWORD_LENGTH` on the backend, which rejects
 * anything shorter with `password_too_short`.
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Step 2 of the recovery, reached from the emailed link: `/reset-password?token=…`.
 *
 * The token is validated on mount. An invalid one never reaches the form; the
 * page offers to ask for a new link instead, since the email may have been
 * opened too late.
 */
@Component({
  selector: 'app-reset-password-page',
  imports: [
    RouterLink,
    FormsModule,
    InputForPasswordComponent,
    MaterialIconComponent,
  ],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
})
export class ResetPasswordPageComponent implements OnInit {
  protected readonly minLength = MIN_PASSWORD_LENGTH;

  token: string | null = null;

  /** `loading` while the token is checked, then either `valid` or `invalid`. */
  state: 'loading' | 'valid' | 'invalid' = 'loading';

  newPassword = '';
  confirmPassword = '';
  saving = false;

  /** Only set when the token was missing or the request itself failed. */
  requestError: string | null = null;
  formError: string | null = null;

  private static readonly RESET_ERRORS: Record<string, string> = {
    reset_token_required: 'El enlace no incluye el token. Solicita uno nuevo.',
    password_required: 'Escribe la nueva contraseña.',
    password_too_short: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    password_confirmation_mismatch: 'Las contraseñas no coinciden.',
    invalid_reset_token: 'El enlace ya fue utilizado. Solicita uno nuevo.',
    reset_token_expired: 'El enlace venció. Solicita uno nuevo.',
  };

  constructor(
    private userService: AppUserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.requestError = 'El enlace no incluye el token.';
      this.state = 'invalid';
      return;
    }

    this.userService.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.state = response?.valid ? 'valid' : 'invalid';
      },
      error: () => {
        this.requestError = 'No se pudo verificar el enlace. Intenta de nuevo.';
        this.state = 'invalid';
      },
    });
  }

  get hasMinLength(): boolean {
    return this.newPassword.length >= MIN_PASSWORD_LENGTH;
  }

  get passwordsMatch(): boolean {
    return !!this.confirmPassword && this.newPassword === this.confirmPassword;
  }

  /**
   * The submit button is never disabled by these rules: a dead button with no
   * explanation reads as a broken screen. `save` refuses and says why.
   */
  get isValid(): boolean {
    return this.hasMinLength && this.passwordsMatch;
  }

  save(): void {
    if (!this.token || this.saving) return;

    this.formError = null;

    if (!this.isValid) {
      this.formError = !this.hasMinLength
        ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
        : 'Las contraseñas no coinciden.';
      return;
    }

    this.saving = true;

    this.userService
      .resetPassword({
        token: this.token,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.toastService.success(
            response?.message ?? 'Contraseña actualizada correctamente.',
          );
          // The token is single use, so going back to the form makes no sense.
          void this.router.navigate(['/auth/login']);
        },
        error: (e: HttpErrorResponse) => {
          this.saving = false;
          const message =
            ResetPasswordPageComponent.RESET_ERRORS[e.error as string] ??
            'No se pudo actualizar la contraseña.';

          // A consumed or expired token invalidates the form itself.
          if (e.error === 'invalid_reset_token' || e.error === 'reset_token_expired') {
            this.state = 'invalid';
          }

          this.formError = message;
          this.toastService.error(message);
        },
      });
  }
}