import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

export const receiptsRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'receipts:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./receipt-list/receipt-list.component').then(c => c.ReceiptListComponent),
      },
    ],
  },
];
