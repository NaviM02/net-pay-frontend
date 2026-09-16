import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', loadComponent: () => import('./home/home.component').then(c => c.HomeComponent) },
    ]
  }
];
