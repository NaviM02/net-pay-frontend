import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, forkJoin, map, of, take } from 'rxjs';
import { CurrentUserService } from '../services/core/current-user.service';
import { AccessControlService } from '../services/core/access-control.service';
import { NOT_FOUND_ROUTE } from '../commons/utils/access.utils';

export const allowNavigationGuard: CanActivateFn = route => {
  const currentUserService = inject(CurrentUserService);
  const accessService = inject(AccessControlService);
  const router = inject(Router);

  if (!currentUserService.isAuthenticated()) {
    currentUserService.logout();
    return router.parseUrl('/auth/login');
  }

  // Refresh effective grants on navigation, including scheduled/expired assignments.
  return forkJoin([currentUserService.getCurrentUser(), accessService.loadAccess(true)]).pipe(
    take(1),
    map(() => {
      const allowed = route.pathFromRoot.every(snapshot => {
        const required = snapshot.data['permission'] as string | string[] | undefined;
        return !required || accessService.hasAnyPermission(required);
      });
      return allowed ? true : router.parseUrl(NOT_FOUND_ROUTE);
    }),
    catchError(() => of(route.routeConfig?.path === '404' ? true : router.parseUrl(NOT_FOUND_ROUTE))),
  );
};
