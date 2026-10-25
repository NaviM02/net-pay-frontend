import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

export const servicesRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'services:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./service-list/service-list.component').then(c => c.ServiceListComponent),
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./service-detail/service-detail.component').then(c => c.ServiceDetailComponent),
      },
    ],
  },
];
