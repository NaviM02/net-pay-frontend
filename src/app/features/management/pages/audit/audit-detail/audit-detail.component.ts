import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppAuditLog } from '../../../../../model/app.model';
import { AppAuditLogService } from '../../../../../services/core/app-audit-log.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import {
  TableRowActionComponent,
  TableRowCustomAction,
} from '../../../../../commons/components/table-row-action/table-row-action.component';
import {
  AuditChangeRow,
  AuditChangeStatus,
  buildAuditChangeRows,
  getAuditDetailRoute,
  getAuditEntityRoute,
  getAuditLevelClass,
  getAuditLevelLabel,
  getAuditEntityLabel,
  getAuditActionLabel,
  getAuditFieldLabel,
} from '../../../../../commons/utils/audit.utils';

@Component({
  selector: 'app-audit-detail',
  templateUrl: './audit-detail.component.html',
  styleUrl: './audit-detail.component.scss',
  imports: [
    DatePipe,
    DetailPageHeaderComponent,
    TableRowActionComponent,
  ],
})
export class AuditDetailComponent implements OnInit {
  protected readonly getAuditLevelClass = getAuditLevelClass;
  protected readonly getAuditLevelLabel = getAuditLevelLabel;
  protected readonly getAuditEntityLabel = getAuditEntityLabel;
  protected readonly getAuditActionLabel = getAuditActionLabel;
  protected readonly getAuditFieldLabel = getAuditFieldLabel;

  protected readonly changeRows: AuditChangeRow[] = [];

  protected readonly changeStatusLabel: Record<AuditChangeStatus, string> = {
    CREATED: 'Creado',
    DELETED: 'Eliminado',
    CHANGED: 'Modificado',
    UNCHANGED: 'Sin cambios',
  };

  protected readonly changeStatusClass: Record<AuditChangeStatus, string> = {
    CREATED: 'np-badge-success',
    DELETED: 'np-badge-error',
    CHANGED: 'np-badge-warning',
    UNCHANGED: 'np-badge-neutral',
  };

  entityType: string | null = null;
  entityHashId: string | null = null;
  auditLogId: number | null = null;

  log: AppAuditLog = new AppAuditLog();

  /** Every entry recorded for the affected entity, newest first. */
  history: AppAuditLog[] = [];

  constructor(
    private auditLogService: AppAuditLogService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .subscribe(params => {
        this.entityType = params.get('entityType');
        this.entityHashId = params.get('entityHashId');
        this.auditLogId = Number(params.get('id')) || null;
        this.findByEntity();
      });
  }

  /** The audit log is resolved from the entity history, newest first. */
  findByEntity(): void {
    if (!this.entityType || !this.entityHashId) {
      void this.router.navigate(['/audit']);
      return;
    }

    this.auditLogService.findByEntity(this.entityType, this.entityHashId).subscribe({
      next: (logs) => {
        this.history = logs ?? [];
        const found = this.history.find(item => item.id === this.auditLogId);

        if (!found) {
          this.toastService.error('El registro de auditoría no existe.');
          void this.router.navigate(['/audit']);
          return;
        }

        this.log = found;
        this.changeRows.length = 0;
        this.changeRows.push(...buildAuditChangeRows(found.changes));
      },
      error: () => {
        this.toastService.error('Error al cargar la auditoría.');
        void this.router.navigate(['/audit']);
      },
    });
  }

  get entityRoute(): string[] | undefined {
    return getAuditEntityRoute(this.entityType, this.entityHashId);
  }

  /** Other entries of the same entity, so the current one is not repeated. */
  get otherHistory(): AppAuditLog[] {
    return this.history.filter(item => item.id !== this.auditLogId);
  }

  rowActions(log: AppAuditLog): TableRowCustomAction[] {
    const route = getAuditDetailRoute(log);
    return route
      ? [{ label: 'Ver auditoría', icon: 'history', action: () => void this.router.navigate(route) }]
      : [];
  }
}
