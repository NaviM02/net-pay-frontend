import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

export const adminPaymentRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./payment-list/payment-list.component').then(c => c.PaymentListComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./payment-form/payment-form.component').then(c => c.PaymentFormComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: ':hashId/edit',
        loadComponent: () =>
          import('./payment-form/payment-form.component').then(c => c.PaymentFormComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./payment-detail/payment-detail.component').then(c => c.PaymentDetailComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];
