import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

/** Personal client list and detail pages. */
export const personalClientRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'my-clients:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client-list/my-client-list.component').then(c => c.MyClientListComponent),
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./client-detail/my-client-detail.component').then(c => c.MyClientDetailComponent),
      },
    ],
  },
];
