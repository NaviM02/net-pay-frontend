import { Routes } from '@angular/router';
import { allowNavigationOutGuard } from './security/allow-navigation-out.guard';
import { AdminComponent } from './layout/admin/admin.component';
import { allowNavigationGuard } from './security/allow-navigation.guard';
import { TypologyEnum } from './model/typology.enum';

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
    canActivate: [allowNavigationGuard], // the layout is open to every role; each area declares its own permission
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(r => r.dashboardRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'users',
        loadChildren: () => import('./features/admin/admin.routes').then(r => r.adminRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./features/admin/pages/services/services.routes').then(r => r.adminServiceRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/admin/pages/clients/clients.routes').then(r => r.adminClientRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/admin/pages/payments/payments.routes').then(r => r.adminPaymentRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'receipts',
        loadChildren: () =>
          import('./features/admin/pages/receipts/receipts.routes').then(r => r.adminReceiptRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/admin/pages/reports/reports.routes').then(r => r.adminReportRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('./features/admin/pages/audit/audits.routes').then(r => r.adminAuditRoutes),
        data: { permission: TypologyEnum.ADMIN },
      },
      {
        // Area of the collector, closed to any other role.
        path: 'collector',
        loadChildren: () =>
          import('./features/collector/collector.routes').then(r => r.collectorRoutes),
      },
      {
        // Any URL that no role can serve. It answers unknown paths and pages
        // of another role with the same page, so it never reveals that a route
        // exists but is not allowed.
        path: '404',
        loadComponent: () =>
          import('./features/errors/not-found/not-found.component').then(c => c.NotFoundComponent),
      },
      { path: '**', redirectTo: '404' },
    ],
  },
];
