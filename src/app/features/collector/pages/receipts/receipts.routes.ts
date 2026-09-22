import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

/** Receipts of the collector: list only. */
export const collectorReceiptRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.COLLECTOR },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./receipt-list/collector-receipt-list.component').then(c => c.CollectorReceiptListComponent),
      },
    ],
  },
];