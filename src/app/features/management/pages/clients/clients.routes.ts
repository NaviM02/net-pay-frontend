import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

export const clientsRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'clients:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client-list/client-list.component').then(c => c.ClientListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./client-form/client-form.component').then(c => c.ClientFormComponent),
        data: { permission: 'clients:create' },
      },
      {
        path: ':hashId/edit',
        loadComponent: () =>
          import('./client-form/client-form.component').then(c => c.ClientFormComponent),
        data: { permission: 'clients:update' },
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./client-detail/client-detail.component').then(c => c.ClientDetailComponent),
      },
    ],
  },
];
