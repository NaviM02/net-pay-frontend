import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

export const adminAuditRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./audit-list/audit-list.component').then(c => c.AuditListComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        // The audit log is read through the entity history, so all three params
        // are needed to resolve it without a get-by-id endpoint.
        path: ':entityType/:entityHashId/:id',
        loadComponent: () =>
          import('./audit-detail/audit-detail.component').then(c => c.AuditDetailComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];
