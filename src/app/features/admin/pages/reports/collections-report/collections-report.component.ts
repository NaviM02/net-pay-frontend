import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  CollectionsReportByCollector,
  CollectionsReportSummary,
} from '../../../../../model/report.model';
import { ReportService } from '../../../../../services/core/report.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { ExportButtonComponent } from '../../../../../commons/components/export-button/export-button.component';
import { Period, PeriodPickerComponent } from '../../../../../commons/components/period-picker/period-picker.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { getCollectorName } from '../../../../../commons/utils/report.utils';

/** Top of the collectors ranking, matches the backend default. */
const COLLECTOR_LIMIT = 10;

@Component({
  selector: 'app-collections-report',
  templateUrl: './collections-report.component.html',
  styleUrl: './collections-report.component.scss',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    ExportButtonComponent,
    PeriodPickerComponent,
    TableRowActionComponent,
  ],
})
export class CollectionsReportComponent implements OnInit {
  protected readonly getCollectorName = getCollectorName;

  protected fromDate: string = this.firstDayOfMonth();
  protected toDate: string = this.today();
  protected periodLabel: string = '';

  protected summary: CollectionsReportSummary | null = null;
  protected byCollector: CollectionsReportByCollector[] = [];
  protected totalCollected: number = 0;

  constructor(
    private reportService: ReportService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.findAll();
  }

  /** Seed of the period picker, taken from the range currently reported. */
  protected get pickerYear(): number {
    return Number(this.fromDate.slice(0, 4)) || new Date().getFullYear();
  }

  protected get pickerMonth(): number {
    return Number(this.fromDate.slice(5, 7)) || new Date().getMonth() + 1;
  }

  /** The picker changes the whole period at once; both dates travel together. */
  onPeriodChange(period: Period): void {
    this.fromDate = `${period.year}-${this.pad(period.month)}-01`;
    this.toDate = this.lastDayOfMonth(period.year, period.month);
    this.findAll();
  }

  findAll(): void {
    const queryParams = new Map<string, string>([
      ['fromDate', this.fromDate],
      ['toDate', this.toDate],
      ['collectorLimit', `${COLLECTOR_LIMIT}`],
    ]);

    this.reportService.findCollections(queryParams).subscribe({
      next: (report) => {
        this.summary = report.summary;
        this.byCollector = report.byCollector ?? [];
        this.totalCollected = this.byCollector.reduce(
          (total, collector) => total + (collector.totalCollected ?? 0),
          0,
        );
        this.fromDate = report.fromDate;
        this.toDate = report.toDate;
        this.periodLabel = `${this.formatDate(report.fromDate)} — ${this.formatDate(report.toDate)}`;
      },
      error: () => this.toastService.error('Error al cargar el reporte de cobros.'),
    });
  }

  collectorRoute(collector: CollectionsReportByCollector): string[] | undefined {
    return collector.collectorHashId ? ['/users', collector.collectorHashId] : undefined;
  }

  /** Percentage of the period total collected by this collector. */
  share(collector: CollectionsReportByCollector): number {
    if (!this.totalCollected) return 0;
    return ((collector.totalCollected ?? 0) / this.totalCollected) * 100;
  }

  private today(): string {
    return this.toIsoDate(new Date());
  }

  private firstDayOfMonth(): string {
    const now = new Date();
    return this.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  private lastDayOfMonth(year: number, month: number): string {
    return this.toIsoDate(new Date(year, month, 0));
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
  }

  private pad(value: number): string {
    return `${value}`.padStart(2, '0');
  }

  /** `2026-01-01` to `01/01/2026`, for the period subtitle. */
  private formatDate(value: string): string {
    const [year, month, day] = (value ?? '').split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }
}