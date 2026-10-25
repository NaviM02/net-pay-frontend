import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

export const paymentsRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'payments:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./payment-list/payment-list.component').then(c => c.PaymentListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./payment-form/payment-form.component').then(c => c.PaymentFormComponent),
        data: { permission: 'payments:create' },
      },
      {
        path: ':hashId/edit',
        loadComponent: () =>
          import('./payment-detail/payment-detail.component').then(c => c.PaymentDetailComponent),
        data: { permission: 'payments:read' },
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./payment-detail/payment-detail.component').then(c => c.PaymentDetailComponent),
      },
    ],
  },
];
