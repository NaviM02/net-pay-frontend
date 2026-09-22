import { Routes } from '@angular/router';
import { allowNavigationOutGuard } from './security/allow-navigation-out.guard';
import { AdminComponent } from './layout/admin/admin.component';
import { allowNavigationGuard } from './security/allow-navigation.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    canActivate: [allowNavigationOutGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [allowNavigationGuard], // to check if the user is authenticated, skip permission check here
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(r => r.dashboardRoutes),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/admin/admin.routes').then(r => r.adminRoutes),
      },
    ],
  },
];
