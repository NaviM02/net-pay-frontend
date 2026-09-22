import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../security/allow-navigation.guard';
import { TypologyEnum } from '../../model/typology.enum';

/**
 * Area of the collector. The `permission` on the wrapper is inherited by every
 * child through `canActivateChild`, so an administrator cannot open these
 * routes either.
 */
export const collectorRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard], // apply guard to all child routes
    data: { permission: TypologyEnum.COLLECTOR },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/collector-dashboard.component').then(c => c.CollectorDashboardComponent),
      },
      {
        path: 'clients',
        loadChildren: () => import('./pages/clients/clients.routes').then(r => r.collectorClientRoutes),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./pages/payments/payments.routes').then(r => r.collectorPaymentRoutes),
      },
      {
        path: 'receipts',
        loadChildren: () =>
          import('./pages/receipts/receipts.routes').then(r => r.collectorReceiptRoutes),
      },
    ],
  },
];