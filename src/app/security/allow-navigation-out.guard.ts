import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { CurrentUserService } from '../services/core/current-user.service';

/**
 * Keeps the auth pages for users without a session. An authenticated user that
 * reaches them is sent to the home of its own role.
 *
 * The redirect is returned as a `UrlTree` instead of navigating imperatively:
 * a navigation started inside a guard races with the one being cancelled.
 */
export const allowNavigationOutGuard: CanActivateFn = (): boolean | UrlTree => {
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);

  if (currentUserService.isAuthenticated()) {
    return router.parseUrl(currentUserService.getHomeRoute());
  }

  return true;
};