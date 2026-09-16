import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserService } from '../services/core/current-user.service';

export const allowNavigationOutGuard: CanActivateFn = (route, state) => {
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);
  if (currentUserService.isAuthenticated()) {
    void router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
