import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

/** Payments of the collector: list, create, edit and detail. */
export const collectorPaymentRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.COLLECTOR },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./payment-list/collector-payment-list.component').then(c => c.CollectorPaymentListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./payment-form/collector-payment-form.component').then(c => c.CollectorPaymentFormComponent),
      },
      {
        path: ':hashId/edit',
        loadComponent: () =>
          import('./payment-form/collector-payment-form.component').then(c => c.CollectorPaymentFormComponent),
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./payment-detail/collector-payment-detail.component').then(c => c.CollectorPaymentDetailComponent),
      },
    ],
  },
];