import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

export const auditRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'audit-logs:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./audit-list/audit-list.component').then(c => c.AuditListComponent),
      },
      {
        // The audit log is read through the entity history, so all three params
        // are needed to resolve it without a get-by-id endpoint.
        path: ':entityType/:entityHashId/:id',
        loadComponent: () =>
          import('./audit-detail/audit-detail.component').then(c => c.AuditDetailComponent),
      },
    ],
  },
];
