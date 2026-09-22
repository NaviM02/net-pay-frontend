import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

export const adminServiceRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./service-list/service-list.component').then(c => c.ServiceListComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./service-detail/service-detail.component').then(c => c.ServiceDetailComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];
