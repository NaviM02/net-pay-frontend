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
    // Password recovery. Public on purpose: the endpoints accept no token and an
    // authenticated user may still open an emailed link. `reset-password` is the
    // exact path the backend builds with `FRONTEND_BASE_URL`.
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password-page/forgot-password-page.component').then(
        c => c.ForgotPasswordPageComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password-page/reset-password-page.component').then(
        c => c.ResetPasswordPageComponent,
      ),
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(r => r.dashboardRoutes),
        data: { permission: 'dashboard:read' },
      },
      {
        path: 'users',
        loadChildren: () => import('./features/management/management.routes').then(r => r.managementRoutes),
        data: { permission: 'users:read' },
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./features/management/pages/services/services.routes').then(r => r.servicesRoutes),
        data: { permission: 'services:read' },
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/management/pages/clients/clients.routes').then(r => r.clientsRoutes),
        data: { permission: 'clients:read' },
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/management/pages/payments/payments.routes').then(r => r.paymentsRoutes),
        data: { permission: 'payments:read' },
      },
      {
        path: 'receipts',
        loadChildren: () =>
          import('./features/management/pages/receipts/receipts.routes').then(r => r.receiptsRoutes),
        data: { permission: 'receipts:read' },
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/management/pages/reports/reports.routes').then(r => r.reportsRoutes),
        data: { permission: 'reports:read' },
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('./features/management/pages/audit/audits.routes').then(r => r.auditRoutes),
        data: { permission: 'audit-logs:read' },
      },
      {
        path: 'roles',
        data: { permission: 'roles:read' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/management/pages/roles/role-list/role-list.component').then(c => c.RoleListComponent),
          },
          {
            path: 'new',
            data: { permission: 'roles:create' },
            loadComponent: () => import('./features/management/pages/roles/role-form/role-form.component').then(c => c.RoleFormComponent),
          },
          {
            path: ':hashId/edit',
            data: { permission: 'roles:update' },
            loadComponent: () => import('./features/management/pages/roles/role-form/role-form.component').then(c => c.RoleFormComponent),
          },
          {
            path: ':hashId',
            loadComponent: () => import('./features/management/pages/roles/role-detail/role-detail.component').then(c => c.RoleDetailComponent),
          },
        ],
      },
      {
        path: 'my-dashboard',
        data: { permission: 'my-dashboard:read' },
        loadComponent: () => import('./features/dashboard/my-dashboard/my-dashboard.component').then(c => c.MyDashboardComponent),
      },
      {
        path: 'my-clients',
        loadChildren: () => import('./features/personal/pages/clients/clients.routes').then(r => r.personalClientRoutes),
      },
      {
        path: 'my-payments',
        loadChildren: () => import('./features/personal/pages/payments/payments.routes').then(r => r.personalPaymentRoutes),
      },
      {
        path: 'my-receipts',
        loadChildren: () => import('./features/personal/pages/receipts/receipts.routes').then(r => r.personalReceiptRoutes),
      },
      {
        path: '404',
        loadComponent: () =>
          import('./features/errors/not-found/not-found.component').then(c => c.NotFoundComponent),
      },
      { path: '**', redirectTo: '404' },
    ],
  },
];
