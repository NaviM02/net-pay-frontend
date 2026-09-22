import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
      },
    ]
  }
];