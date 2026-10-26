import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexNoData,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';

import { AppPayment } from '../../../model/app.model';
import {
  MyDashboard,
  MyDashboardSummary,
  DashboardCollectionByMethod,
  DashboardCollectionsByMonth,
} from '../../../model/dashboard.model';
import { OverdueClientReport } from '../../../model/report.model';
import { DashboardService } from '../../../services/core/dashboard.service';
import { ToastService } from '../../../services/other/toast.service';
import { ListPageHeaderComponent } from '../../../commons/components/list-page-header/list-page-header.component';
import { Period, PeriodPickerComponent } from '../../../commons/components/period-picker/period-picker.component';
import { TableRowActionComponent } from '../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../commons/components/typology-badge/typology-badge.component';
import {
  buildMethodChart,
  buildMonthlyChart,
  getPaymentMethodColor,
  getPaymentMethodLabel,
  orderCollectionsByMethod,
} from '../../../commons/utils/dashboard.utils';
import {
  formatOverduePeriod,
  getOverdueStatusClass,
} from '../../../commons/utils/report.utils';

/**
 * Personal dashboard summary: what the signed-in user collected this month, which
 * of their clients are late and how the collections are spread. Everything comes already
 * filtered by the backend, so nothing here can reach another portfolio.
 */
@Component({
  selector: 'app-my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrl: './my-dashboard.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    ChartComponent,
    ListPageHeaderComponent,
    PeriodPickerComponent,
    TableRowActionComponent,
    TypologyBadgeComponent,
  ],
})
export class MyDashboardComponent implements OnInit {
  protected readonly getPaymentMethodLabel = getPaymentMethodLabel;
  protected readonly getPaymentMethodColor = getPaymentMethodColor;
  protected readonly getOverdueStatusClass = getOverdueStatusClass;
  protected readonly formatOverduePeriod = formatOverduePeriod;

  protected year: number = new Date().getFullYear();
  protected month: number = new Date().getMonth() + 1;

  protected summary: MyDashboardSummary | null = null;
  protected monthLabel: string = '';

  protected recentPayments: AppPayment[] = [];
  protected overdueClients: OverdueClientReport[] = [];
  protected collectionsByMethod: DashboardCollectionByMethod[] = [];

  // One field per `apx-chart` input: a getter returning a new array on every
  // change detection cycle would make ApexCharts redraw constantly.
  protected methodChart: ApexChart = {
    type: 'donut',
    height: 300,
    fontFamily: 'Inter, system-ui, sans-serif',
  };
  protected methodChartSeries: ApexNonAxisChartSeries = [];
  protected methodChartLabels: string[] = [];
  protected methodChartColors: string[] = [];
  protected methodChartStroke: ApexStroke = { width: 2, colors: ['#FFFFFF'] };
  protected methodChartLegend: ApexLegend = { position: 'bottom', markers: { strokeWidth: 10 } };
  protected methodChartDataLabels: ApexDataLabels = { enabled: false };
  protected methodChartPlotOptions: ApexPlotOptions = {
    pie: { donut: { size: '68%', labels: { show: true } } },
  };
  protected methodChartTooltip: ApexTooltip = { y: { formatter: value => `Q ${value}` } };
  protected methodChartNoData: ApexNoData = { text: 'Sin cobros en el periodo' };

  protected monthlyChart: ApexChart = {
    type: 'bar',
    height: 300,
    fontFamily: 'Inter, system-ui, sans-serif',
    stacked: true,
  };
  protected monthlyChartSeries: ApexAxisChartSeries = [];
  protected monthlyChartColors: string[] = [];
  protected monthlyChartPlotOptions: ApexPlotOptions = {
    bar: { columnWidth: '45%', borderRadius: 3, borderRadiusApplication: 'end' },
  };
  protected monthlyChartLegend: ApexLegend = { position: 'bottom', markers: { strokeWidth: 10 } };
  protected monthlyChartStroke: ApexStroke = { show: false };
  protected monthlyChartDataLabels: ApexDataLabels = { enabled: false };
  protected monthlyChartGrid: ApexGrid = { borderColor: '#F1F5F9', strokeDashArray: 4 };
  protected monthlyChartXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  protected monthlyChartYaxis: ApexYAxis = {
    labels: { formatter: value => `Q ${Number(value).toLocaleString('es-GT')}` },
  };
  protected monthlyChartTooltip: ApexTooltip = { y: { formatter: value => `Q ${value}` } };
  protected monthlyChartNoData: ApexNoData = { text: 'Sin cobros registrados' };

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.findAll();
  }

  onPeriodChange(period: Period): void {
    this.year = period.year;
    this.month = period.month;
    this.findAll();
  }

  findAll(): void {
    const queryParams = new Map<string, string>([
      ['year', `${this.year}`],
      ['month', `${this.month}`],
    ]);

    this.dashboardService.findMyDashboard(queryParams).subscribe({
      next: (dashboard) => {
        this.summary = dashboard.summary;
        this.monthLabel = dashboard.summary?.monthLabel ?? '';
        this.recentPayments = dashboard.recentPayments ?? [];
        this.overdueClients = dashboard.overdueClients ?? [];

        this.applyMethodChart(dashboard.collectionsByMethod ?? []);
        this.applyMonthlyChart(dashboard.collectionsByMethodByMonth ?? []);
      },
      error: () => this.toastService.error('Error al cargar el dashboard.'),
    });
  }

  /** Tooltip with the expired and unpaid periods of the client. */
  periodsTooltip(client: OverdueClientReport): string {
    const periods = (client.overduePeriods ?? []).map(formatOverduePeriod);
    return periods.length ? periods.join(' · ') : 'Sin periodos vencidos';
  }

  private applyMethodChart(collections: DashboardCollectionByMethod[]): void {
    const config = buildMethodChart(collections);

    this.collectionsByMethod = orderCollectionsByMethod(collections);
    this.methodChart = config.chart;
    this.methodChartSeries = config.series;
    this.methodChartLabels = config.labels;
    this.methodChartColors = config.colors;
    this.methodChartStroke = config.stroke;
    this.methodChartLegend = config.legend;
    this.methodChartDataLabels = config.dataLabels;
    this.methodChartPlotOptions = config.plotOptions;
    this.methodChartTooltip = config.tooltip;
    this.methodChartNoData = config.noData;
  }

  private applyMonthlyChart(months: DashboardCollectionsByMonth[]): void {
    const config = buildMonthlyChart(months);

    this.monthlyChart = config.chart;
    this.monthlyChartSeries = config.series;
    this.monthlyChartColors = config.colors;
    this.monthlyChartPlotOptions = config.plotOptions;
    this.monthlyChartStroke = config.stroke;
    this.monthlyChartDataLabels = config.dataLabels;
    this.monthlyChartLegend = config.legend;
    this.monthlyChartXaxis = config.xaxis;
    this.monthlyChartYaxis = config.yaxis;
    this.monthlyChartGrid = config.grid;
    this.monthlyChartTooltip = config.tooltip;
    this.monthlyChartNoData = config.noData;
  }
}
