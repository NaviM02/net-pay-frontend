import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../services/other/toast.service';
import { AuthService } from '../../../../services/core/auth.service';
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

  authReq: AuthRequestDto;

  showPassword = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
  ) {
    this.authReq = new AuthRequestDto();
  }

  doLogin() {
    if (!this.isValid) return this.toastService.warning('Llenar los campos necesarios');

    this.authService.doLogin(this.authReq).subscribe({
      next: (_) => {
        this.toastService.success('Inicio de sesión exitoso');
        void this.router.navigate(['dashboard']);
      },
      error: (e: HttpErrorResponse) => {
        if (e.error == 'wrong_credentials')
          return this.toastService.error('Credenciales incorrectas');
        this.toastService.error('Error del servidor');
      },
    });
  }

  get isValid(): boolean {
    return (
      !!this.authReq.email &&
      !!this.authReq.password &&
      !!this.authReq.email.trim() &&
      !!this.authReq.password.trim()
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
