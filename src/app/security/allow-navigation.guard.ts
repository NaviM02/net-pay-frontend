import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs';

import { ToastService } from '../services/other/toast.service';
import { CurrentUserService } from '../services/core/current-user.service';
import { NOT_FOUND_ROUTE } from '../commons/utils/role.utils';

/**
 * Reads the `data.permission` that applies to a route: the one declared on it,
 * or the nearest one declared by an ancestor, so a parent can require a role for
 * all of its children without repeating it on each of them.
 *
 * `canActivateChild` hands over the child being activated, never the parent that
 * declares the permission, which is why the lookup walks up the tree.
 */
function resolveRequiredPermission(route: ActivatedRouteSnapshot): number | undefined {
  let current: ActivatedRouteSnapshot | null = route;

  while (current) {
    const permission = current.data?.['permission'];
    if (permission !== undefined && permission !== null) return permission as number;

    current = current.parent;
  }

  return undefined;
}

/**
 * Blocks unauthenticated users and, when the route declares `data.permission`,
 * every role other than that one.
 *
 * A user without access is redirected to the not-found route: the answer must
 * not tell them that the page exists or that they lack permissions.
 */
export const allowNavigationGuard: CanActivateFn = route => {
  const currentUserService = inject(CurrentUserService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  if (!currentUserService.isAuthenticated()) {
    currentUserService.logout();
    toastService.error('Hacer login otra vez');
    return false;
  }

  const requiredPermission = resolveRequiredPermission(route);
  if (requiredPermission === undefined) return true;

  return currentUserService.getCurrentUser().pipe(
    take(1),
    // `getCurrentUser` leaves the profile in the cache, so `hasRole` can read it.
    map((): boolean | UrlTree => {
      if (currentUserService.hasRole(requiredPermission)) return true;

      return router.parseUrl(NOT_FOUND_ROUTE);
    }),
  );
};