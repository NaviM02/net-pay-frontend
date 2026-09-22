import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppAuditLog } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppAuditLogService } from '../../../../../services/core/app-audit-log.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import {
  TableRowActionComponent,
  TableRowCustomAction,
} from '../../../../../commons/components/table-row-action/table-row-action.component';
import {
  getAuditDetailRoute,
  getAuditEntityRoute,
  getAuditLevelClass,
} from '../../../../../commons/utils/audit.utils';
import { AuditListFilter } from './audit-list.filter';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrl: './audit-list.component.scss',
  imports: [
    DatePipe,
    ListPageHeaderComponent,
    FilterMenuComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class AuditListComponent implements OnInit {
  protected readonly getAuditLevelClass = getAuditLevelClass;

  auditLogs: AppAuditLog[] = [];

  constructor(
    private auditLogService: AppAuditLogService,
    private toastService: ToastService,
    private router: Router,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(AuditListFilter, new Pagination('audit-list-pagination'), () =>
      this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.auditLogService.findAll(this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.auditLogs = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.auditLogs.length;
        this.listStateService.updatePagination(total, this.auditLogs.length);
      },
      error: () => this.toastService.error('Error al cargar la auditoría.'),
    });
  }

  /**
   * Go to the record that originated the action, and to the detail of the
   * audit log itself. The entity action is omitted for entity types without
   * a detail page (e.g. RECEIPT).
   */
  rowActions(log: AppAuditLog): TableRowCustomAction[] {
    const actions: TableRowCustomAction[] = [];

    const entityRoute = getAuditEntityRoute(log.entityType, log.entityHashId);
    if (entityRoute) {
      actions.push({
        label: 'Ver entidad afectada',
        icon: 'visibility',
        action: () => void this.router.navigate(entityRoute),
      });
    }

    const detailRoute = getAuditDetailRoute(log);
    if (detailRoute) {
      actions.push({
        label: 'Ver auditoría',
        icon: 'history',
        action: () => void this.router.navigate(detailRoute),
      });
    }

    return actions;
  }
}
