import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';

export const reportsRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'reports:read' },
    children: [
      {
        path: '',
        loadComponent: () => import('./report-page/report-page.component').then(c => c.ReportPageComponent),
      },
    ],
  },
];
