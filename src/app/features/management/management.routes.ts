import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../security/allow-navigation.guard';

export const managementRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard], // apply guard to all child routes
    data: { permission: 'users:read' },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(c => c.UserListComponent),
      },
      {
        path: 'new',
        data: { permission: 'users:create' },
        loadComponent: () => import('./pages/users/user-form-modal/user-form-modal.component').then(c => c.UserFormModalComponent),
      },
      {
        path: ':hashId/edit',
        data: { permission: 'users:update' },
        loadComponent: () => import('./pages/users/user-form-modal/user-form-modal.component').then(c => c.UserFormModalComponent),
      },
      {
        path: ':hashId',
        loadComponent: () => import('./pages/users/user-detail/user-detail.component').then((c) => c.UserDetailComponent),
      },
    ],
  },
];
