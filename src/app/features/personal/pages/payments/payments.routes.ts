import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

/** Personal payment list, creation and details have independent grants. */
export const personalPaymentRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    children: [
      {
        path: '',
        data: { permission: 'my-payments:read' },
        loadComponent: () =>
          import('./payment-list/my-payment-list.component').then(c => c.MyPaymentListComponent),
      },
      {
        path: 'new',
        data: { permission: 'my-payments:create' },
        loadComponent: () =>
          import('./payment-form/my-payment-form.component').then(c => c.MyPaymentFormComponent),
      },
      {
        path: ':hashId/edit',
        data: { permission: 'my-payments:read' },
        loadComponent: () =>
          import('./payment-detail/my-payment-detail.component').then(c => c.MyPaymentDetailComponent),
      },
      {
        path: ':hashId',
        data: { permission: 'my-payments:read' },
        loadComponent: () =>
          import('./payment-detail/my-payment-detail.component').then(c => c.MyPaymentDetailComponent),
      },
    ],
  },
];
