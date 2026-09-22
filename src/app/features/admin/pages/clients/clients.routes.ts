import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

export const adminClientRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client-list/client-list.component').then(c => c.ClientListComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./client-form/client-form.component').then(c => c.ClientFormComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: ':hashId/edit',
        loadComponent: () =>
          import('./client-form/client-form.component').then(c => c.ClientFormComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./client-detail/client-detail.component').then(c => c.ClientDetailComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];
