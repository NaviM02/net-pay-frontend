import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AccessControlService } from '../services/core/access-control.service';
import { CurrentUserService } from '../services/core/current-user.service';

/**
 * Keeps the auth pages for users without a session. An authenticated user that
 * reaches them is sent to the first page allowed by its effective permissions.
 *
 * The redirect is returned as a `UrlTree` instead of navigating imperatively:
 * a navigation started inside a guard races with the one being cancelled.
 */
export const allowNavigationOutGuard: CanActivateFn = () => {
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);
  const accessService = inject(AccessControlService);

  if (currentUserService.isAuthenticated()) {
    return accessService.loadAccess(true).pipe(
      map(() => router.parseUrl(currentUserService.getHomeRoute())),
      catchError(() => {
        currentUserService.logout();
        return of(true);
      }),
    );
  }

  return true;
};
