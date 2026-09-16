import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page.component').then(c => c.LoginPageComponent)
  },
/*  {
    path: 'password-recovery/:hashId/:token',
    loadComponent: () => import('./pages/password-recovery-page/password-recovery-page.component').then(c => c.PasswordRecoveryPageComponent)
  },
  {
    path: 'request-password-recovery',
    loadComponent: () => import('./pages/request-password-recovery-page/request-password-recovery-page.component').then(c => c.RequestPasswordRecoveryPageComponent)
  },
  {
    path: 'verify-email/:hashId/:token',
    loadComponent: () => import('./pages/verify-email-page/verify-email-page.component').then(c => c.VerifyEmailPageComponent)
  },
  {
    path: 'email-verification/:email',
    loadComponent: () => import('./pages/request-email-verification-page/request-email-verification-page.component').then(c => c.RequestEmailVerificationPageComponent)
  }*/
];
