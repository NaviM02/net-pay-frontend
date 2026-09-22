import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../security/allow-navigation.guard';
import { TypologyEnum } from '../../model/typology.enum';

/** Administrator dashboard. */
export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
      },
    ]
  }
];