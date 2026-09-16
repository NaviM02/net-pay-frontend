import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ToastService } from '../services/other/toast.service';
import { CurrentUserService } from '../services/core/current-user.service';

export const allowNavigationGuard: CanActivateFn = (route, state) => {
  const currentUserService: CurrentUserService = inject(CurrentUserService);
  const toastService = inject(ToastService)

  if (!currentUserService.isAuthenticated()) {
    currentUserService.logout();
    toastService.error('Hacer login otra vez');
    return false;
  }

  return true;
};
