import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../services/other/toast.service';
import { AuthService } from '../../../../services/core/auth.service';
import { CurrentUserService } from '../../../../services/core/current-user.service';
import { AuthRequestDto } from '../../../../model/app.model';
import { HttpErrorResponse } from '@angular/common/http';
import {
  InputForPasswordComponent
} from '../../../../commons/components/input-for-password/input-for-password.component';
import { InputWithIconComponent } from '../../../../commons/components/input-with-icon/input-with-icon.component';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink, InputForPasswordComponent, InputWithIconComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  email = '';
  password = '';
  twoFactorCode = '';
  challengeId: string | null = null;
  expiresAt: string | null = null;
  submitting = false;

  authReq: AuthRequestDto;

  showPassword = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private currentUserService: CurrentUserService,
  ) {
    this.authReq = new AuthRequestDto();
  }

  doLogin() {
    if (!this.isValid) return this.toastService.warning('Llenar los campos necesarios');

    this.submitting = true;
    this.authService.doLogin(this.authReq).subscribe({
      next: (response) => {
        if (response.twoFactorRequired) {
          this.challengeId = response.challengeId;
          this.expiresAt = response.expiresAt;
          this.toastService.success('Enviamos un código de verificación a tu correo.');
          this.submitting = false;
          return;
        }
        this.finishLogin();
      },
      error: (e: HttpErrorResponse) => {
        this.submitting = false;
        if (e.error == 'wrong_credentials')
          return this.toastService.error('Credenciales incorrectas');
        if (e.error === 'two_factor_retry_later')
          return this.toastService.warning('Espera un minuto antes de solicitar otro código.');
        this.toastService.error('Error del servidor');
      },
    });
  }

  verifyTwoFactor(): void {
    if (!this.challengeId || !/^\d{6}$/.test(this.twoFactorCode)) {
      this.toastService.warning('Introduce el código de seis dígitos enviado a tu correo.');
      return;
    }
    this.submitting = true;
    this.authService.verifyTwoFactor(this.challengeId, this.twoFactorCode).subscribe({
      next: () => this.finishLogin(),
      error: (e: HttpErrorResponse) => {
        this.submitting = false;
        if (e.error === 'invalid_two_factor_code') {
          this.toastService.error('El código no es válido o ha vencido. Inicia sesión de nuevo para solicitar otro.');
          this.cancelTwoFactor();
          return;
        }
        this.toastService.error('No se pudo verificar el código.');
      },
    });
  }

  cancelTwoFactor(): void {
    this.challengeId = null;
    this.twoFactorCode = '';
    this.expiresAt = null;
  }

  private finishLogin(): void {
    this.submitting = false;
        this.toastService.success('Inicio de sesión exitoso');
        // Choose the first page granted by the effective permissions.
        void this.router.navigateByUrl(this.currentUserService.getHomeRoute());
  }

  get isValid(): boolean {
    return (
      !!this.authReq.email &&
      !!this.authReq.password &&
      !!this.authReq.email.trim() &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.authReq.email.trim()) &&
      !!this.authReq.password.trim()
    );
  }

  get isCodeValid(): boolean {
    return /^\d{6}$/.test(this.twoFactorCode);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
