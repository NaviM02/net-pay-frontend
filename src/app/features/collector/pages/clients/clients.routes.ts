import { Routes } from '@angular/router';
import { allowNavigationGuard } from '../../../../security/allow-navigation.guard';
import { TypologyEnum } from '../../../../model/typology.enum';

/** Clients of the collector: list and detail by `hashId`. */
export const collectorClientRoutes: Routes = [
  {
    path: '',
    canActivate: [allowNavigationGuard],
    canActivateChild: [allowNavigationGuard],
    data: { permission: TypologyEnum.COLLECTOR },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client-list/collector-client-list.component').then(c => c.CollectorClientListComponent),
      },
      {
        path: ':hashId',
        loadComponent: () =>
          import('./client-detail/collector-client-detail.component').then(c => c.CollectorClientDetailComponent),
      },
    ],
  },
];