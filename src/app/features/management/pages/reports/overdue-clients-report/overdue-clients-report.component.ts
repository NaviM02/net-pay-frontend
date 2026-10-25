import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { OverdueClientReport } from '../../../../../model/report.model';
import { ReportExportFormatEnum } from '../../../../../model/report.enum';
import { Pagination } from '../../../../../model/filter.model';
import { ReportService } from '../../../../../services/core/report.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { ExportButtonComponent } from '../../../../../commons/components/export-button/export-button.component';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { MaterialIconComponent } from '../../../../../commons/components/material-icon/material-icon.component';
import { downloadBlob, getFileNameFromDisposition } from '../../../../../commons/utils/blob.utils';
import {
  formatOverduePeriod,
  getOverdueStatusClass,
} from '../../../../../commons/utils/report.utils';
import { OverdueClientsReportFilter } from './overdue-clients-report.filter';

/** Base name used when the response does not advertise a `Content-Disposition`. */
const EXPORT_FILE_BASENAME = 'reporte-clientes-en-mora';

@Component({
  selector: 'app-overdue-clients-report',
  templateUrl: './overdue-clients-report.component.html',
  styleUrl: './overdue-clients-report.component.scss',
  imports: [
    CurrencyPipe,
    ExportButtonComponent,
    FilterMenuComponent,
    MaterialIconComponent,
    PaginationComponent,
    TableRowActionComponent,
  ],
})
export class OverdueClientsReportComponent implements OnInit {
  protected readonly getOverdueStatusClass = getOverdueStatusClass;
  protected readonly formatOverduePeriod = formatOverduePeriod;

  overdueClients: OverdueClientReport[] = [];
  exporting: boolean = false;

  constructor(
    private reportService: ReportService,
    private toastService: ToastService,
    private router: Router,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(
      OverdueClientsReportFilter,
      new Pagination('overdue-clients-report-pagination'),
      () => this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.reportService.findOverdueClients(this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.overdueClients = response.body ?? [];
        const total =
          Number(response.headers.get('X-Total-Count')) || this.overdueClients.length;
        this.listStateService.updatePagination(total, this.overdueClients.length);
      },
      error: () => this.toastService.error('Error al cargar el reporte de mora.'),
    });
  }

  /** Tooltip with every expired and unpaid period of the client. */
  periodsTooltip(client: OverdueClientReport): string {
    const periods = (client.overduePeriods ?? []).map(formatOverduePeriod);
    return periods.length ? periods.join(' · ') : 'Sin periodos vencidos';
  }

  /**
   * The export always returns every row matching the filter, so pagination is
   * left out and only the active filters travel with the request.
   */
  onExport(format: ReportExportFormatEnum): void {
    const queryParams = new Map<string, string>();

    for (const [key, value] of this.listStateService.queryParams) {
      if (key === 'size' || key === 'offset') continue;
      queryParams.set(key, value);
    }

    queryParams.set('format', format);
    this.exporting = true;

    this.reportService
      .exportOverdueClients(queryParams)
      // `complete` is not emitted on error, so the busy state is cleared here.
      .pipe(finalize(() => (this.exporting = false)))
      .subscribe({
        next: (response) => {
          if (!response.body) {
            this.toastService.error('No se pudo exportar el reporte.');
            return;
          }

          downloadBlob(
            response.body,
            getFileNameFromDisposition(
              response.headers.get('Content-Disposition'),
              `${EXPORT_FILE_BASENAME}.${format}`,
            ),
          );
          this.toastService.success('Reporte exportado correctamente.');
        },
        error: () => this.toastService.error('No se pudo exportar el reporte.'),
      });
  }

  viewClient(hashId: string): void {
    void this.router.navigate(['/clients', hashId]);
  }
}