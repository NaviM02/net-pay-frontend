import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../security/allow-navigation.guard';

/** Operations dashboard. */
export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: 'dashboard:read' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./overview/dashboard-overview.component').then(c => c.DashboardOverviewComponent),
      },
    ]
  }
];
