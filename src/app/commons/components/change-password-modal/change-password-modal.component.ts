import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppUserService } from '../../../services/core/app-user.service';
import { ToastService } from '../../../services/other/toast.service';
import { InputForPasswordComponent } from '../input-for-password/input-for-password.component';

@Component({
  selector: 'app-change-password-modal',
  imports: [FormsModule, InputForPasswordComponent],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.scss',
})
export class ChangePasswordModalComponent {
  /** User hash for the CRUD flow; null targets the signed-in user's profile. */
  targetHashId: string | null = null;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  saving = false;

  constructor(
    public activeModal: NgbActiveModal,
    private userService: AppUserService,
    private toastService: ToastService,
  ) {}

  save(): void {
    if (this.saving) return;
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.toastService.warning('Completa todos los campos de contraseña.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.toastService.warning('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.warning('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (this.currentPassword === this.newPassword) {
      this.toastService.warning('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    this.saving = true;
    this.userService.changePassword(this.targetHashId, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    }).subscribe({
      next: response => {
        this.toastService.success(response?.message ?? 'Contraseña actualizada correctamente.');
        this.activeModal.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.toastService.error(this.errorMessage(error));
      },
    });
  }

  private errorMessage(error: HttpErrorResponse): string {
    const code = typeof error.error === 'string' ? error.error : error.error?.message;
    const messages: Record<string, string> = {
      wrong_password: 'La contraseña actual no es correcta.',
      current_password_incorrect: 'La contraseña actual no es correcta.',
      invalid_current_password: 'La contraseña actual no es correcta.',
      current_password_required: 'Escribe la contraseña actual.',
      password_confirmation_mismatch: 'Las nuevas contraseñas no coinciden.',
      password_too_short: 'La nueva contraseña debe tener al menos 8 caracteres.',
      password_required: 'Completa todos los campos de contraseña.',
    };
    return messages[code] ?? 'No se pudo actualizar la contraseña.';
  }
}
