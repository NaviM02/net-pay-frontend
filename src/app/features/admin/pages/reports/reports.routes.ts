import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

export const adminReportRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.ADMIN },
    children: [
      {
        path: '',
        loadComponent: () => import('./report-page/report-page.component').then(c => c.ReportPageComponent),
        data: { permissionType: TypologyEnum.ADMIN },
      },
    ],
  },
];