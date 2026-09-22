import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../security/allow-navigation.guard';
import { AdmTypology } from '../../model/app.model';
import { TypologyEnum } from '../../model/typology.enum';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard], // apply guard to all child routes
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(c => c.UserListComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: ':hashId',
        loadComponent: () => import('./pages/users/user-detail/user-detail.component').then((c) => c.UserDetailComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];
