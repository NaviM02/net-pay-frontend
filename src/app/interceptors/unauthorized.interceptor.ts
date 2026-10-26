import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, of, switchMap, throwError } from 'rxjs';
import { ToastService } from '../services/other/toast.service';
import { CurrentUserService } from '../services/core/current-user.service';
import { AccessControlService } from '../services/core/access-control.service';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUserService = inject(CurrentUserService);
  const toastService = inject(ToastService);
  const accessService = inject(AccessControlService);

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

        if (err.status === 403 && !req.url.endsWith('/auth/access')) {
          toastService.warning('No tienes permiso para realizar esta acción.');
          return accessService.loadAccess(true).pipe(
            catchError(() => of(null)),
            switchMap(() => throwError(() => err)),
          );
        }

        // Rethrow other errors
        throw err;
      })
    );
};
