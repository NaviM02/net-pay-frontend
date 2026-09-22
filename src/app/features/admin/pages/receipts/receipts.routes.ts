import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

export const adminReceiptRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./receipt-list/receipt-list.component').then(c => c.ReceiptListComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];
