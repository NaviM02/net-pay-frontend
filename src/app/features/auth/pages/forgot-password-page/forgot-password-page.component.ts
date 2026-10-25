import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppUserService } from '../../../../services/core/app-user.service';
import { ToastService } from '../../../../services/other/toast.service';
import { InputWithIconComponent } from '../../../../commons/components/input-with-icon/input-with-icon.component';
import { MaterialIconComponent } from '../../../../commons/components/material-icon/material-icon.component';

/**
 * Step 1 of the recovery: asks for the reset link.
 *
 * The endpoint answers `200` whether or not the email is registered, so the
 * success message is always the same generic one. A `400` only arrives when the
 * email does exist and the delivery failed, and those keys are shown apart.
 */
@Component({
  selector: 'app-forgot-password-page',
  imports: [RouterLink, FormsModule, InputWithIconComponent, MaterialIconComponent],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.scss',
})
export class ForgotPasswordPageComponent {
  email = '';
  submitted = false;
  sending = false;

  /** Generic confirmation, never says whether the account exists. */
  successMessage = '';
  /** Delivery failures, which are safe to show because the email exists. */
  deliveryError: string | null = null;

  private static readonly DELIVERY_ERRORS: Record<string, string> = {
    email_required: 'Escribe el correo con el que inicias sesión.',
    email_not_configured: 'El envío de correos no está configurado. Contacta al administrador.',
    email_auth_failed: 'No se pudo autorizar el envío de correos. Contacta al administrador.',
    email_send_failed: 'No se pudo enviar el correo. Intenta de nuevo en unos minutos.',
  };

  constructor(
    private userService: AppUserService,
    private toastService: ToastService,
  ) {}

  get isValid(): boolean {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email.trim());
  }

  sendLink(): void {
    if (!this.isValid || this.sending) return;

    this.sending = true;
    this.deliveryError = null;

    this.userService.forgotPassword(this.email.trim()).subscribe({
      next: (response) => {
        this.sending = false;
        this.submitted = true;
        this.successMessage =
          response?.message ??
          'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.';
      },
      error: (e: HttpErrorResponse) => {
        this.sending = false;
        this.deliveryError =
          ForgotPasswordPageComponent.DELIVERY_ERRORS[e.error as string] ??
          'No se pudo completar la solicitud.';
        this.toastService.error(this.deliveryError);
      },
    });
  }
}
