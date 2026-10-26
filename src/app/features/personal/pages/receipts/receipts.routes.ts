import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

/** Personal receipt list. */
export const personalReceiptRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'my-receipts:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./receipt-list/my-receipt-list.component').then(c => c.MyReceiptListComponent),
      },
    ],
  },
];
