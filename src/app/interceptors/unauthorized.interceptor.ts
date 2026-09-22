import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY } from 'rxjs';
import { ToastService } from '../services/other/toast.service';
import { CurrentUserService } from '../services/core/current-user.service';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUserService = inject(CurrentUserService);
  const toastService = inject(ToastService);

  return next(req)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        // If the error is due to wrong credentials, rethrow it
        if (err.status === 401 && err.error === 'Credenciales inválidas') throw err;

        // If the error is due to a required password change, rethrow it
        if (err.status === 400 && err.error === 'require_change_password') throw err;

        // For other 401 errors, log out the user and show a toast message
        if (err.status === 401) {
          currentUserService.logout();
          toastService.error('Inicia sesion para conectarte');
          return EMPTY;
        }

        // Rethrow other errors
        throw err;
      })
    );
};
