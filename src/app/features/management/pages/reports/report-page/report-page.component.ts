import { Component } from '@angular/core';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';

import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { CollectionsReportComponent } from '../collections-report/collections-report.component';
import { OverdueClientsReportComponent } from '../overdue-clients-report/overdue-clients-report.component';

/** Report ids, kept in sync with the `NgbNavItem` ids of the template. */
export enum ReportTabEnum {
  COLLECTIONS = 'collections',
  OVERDUE_CLIENTS = 'overdue-clients',
}

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.scss',
imports: [
      NgbNav,
      NgbNavItem,
      NgbNavLink,
      NgbNavContent,
      NgbNavOutlet,
    ListPageHeaderComponent,
    CollectionsReportComponent,
    OverdueClientsReportComponent,
  ],
})
export class ReportPageComponent {
  protected readonly ReportTabEnum = ReportTabEnum;

  activeTab: ReportTabEnum = ReportTabEnum.COLLECTIONS;
}