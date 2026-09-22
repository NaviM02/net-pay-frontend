import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

import { AppAuditLog, AppPayment } from '../../../model/app.model';
import {
  AdminDashboard,
  DashboardClientByPlan,
  DashboardCollectionByMethod,
  DashboardCollectionsByMonth,
} from '../../../model/dashboard.model';
import { DashboardService } from '../../../services/core/dashboard.service';
import { ToastService } from '../../../services/other/toast.service';
import { ListPageHeaderComponent } from '../../../commons/components/list-page-header/list-page-header.component';
import { Period, PeriodPickerComponent } from '../../../commons/components/period-picker/period-picker.component';
import {
  TableRowActionComponent,
  TableRowCustomAction,
} from '../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../commons/components/typology-badge/typology-badge.component';
import { getAuditLevelClass } from '../../../commons/utils/audit.utils';
import {
  buildClientsByPlanSeries,
  buildMonthlyCollectionSeries,
  formatCurrency,
  getPaymentMethodColor,
  getPaymentMethodLabel,
  orderCollectionsByMethod,
} from '../../../commons/utils/report.utils';

const CHART_FONT_FAMILY = 'Inter, system-ui, sans-serif';
const CHART_HEIGHT = 300;
const CHART_LEGEND: ApexLegend = {
  position: 'bottom',
  fontSize: '13px',
  markers: { strokeWidth: 10 },
};
const CHART_NO_DATA_LABELS: ApexDataLabels = { enabled: false };
const CHART_BORDERLESS: ApexStroke = { show: false };
const CHART_GRID: ApexGrid = { borderColor: '#F1F5F9', strokeDashArray: 4 };
const CHART_TOOLTIP_CURRENCY: ApexTooltip = { y: { formatter: value => formatCurrency(value) } };

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
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
export class AdminDashboardComponent implements OnInit {
  protected readonly getAuditLevelClass = getAuditLevelClass;
  protected readonly getPaymentMethodLabel = getPaymentMethodLabel;
  protected readonly getPaymentMethodColor = getPaymentMethodColor;

  protected year: number = new Date().getFullYear();
  protected month: number = new Date().getMonth() + 1;

  protected summary: AdminDashboard['summary'] | null = null;
  protected monthLabel: string = '';

  protected recentPayments: AppPayment[] = [];
  protected recentActivities: AppAuditLog[] = [];
  protected clientsByPlan: DashboardClientByPlan[] = [];
  protected collectionsByMethod: DashboardCollectionByMethod[] = [];

  // `apx-chart` takes one input per option group. They are plain fields on
  // purpose: a getter returning a new array on every change detection cycle
  // would make ApexCharts redraw the charts constantly.
  protected methodChart: ApexChart = { type: 'donut', height: CHART_HEIGHT, fontFamily: CHART_FONT_FAMILY };
  protected methodChartSeries: ApexNonAxisChartSeries = [];
  protected methodChartLabels: string[] = [];
  protected methodChartColors: string[] = [];
  protected methodChartStroke: ApexStroke = { width: 2, colors: ['#FFFFFF'] };
  protected methodChartLegend: ApexLegend = CHART_LEGEND;
  protected methodChartDataLabels: ApexDataLabels = CHART_NO_DATA_LABELS;
  protected methodChartTooltip: ApexTooltip = CHART_TOOLTIP_CURRENCY;
  protected methodChartNoData: ApexNoData = { text: 'Sin cobros en el periodo' };
  protected methodChartPlotOptions: ApexPlotOptions = {
    pie: { donut: { size: '68%', labels: { show: true } } },
  };

  protected monthlyChart: ApexChart = {
    type: 'bar',
    height: CHART_HEIGHT,
    fontFamily: CHART_FONT_FAMILY,
    stacked: true,
  };
  protected monthlyChartSeries: ApexAxisChartSeries = [];
  protected monthlyChartColors: string[] = [];
  protected monthlyChartPlotOptions: ApexPlotOptions = {
    bar: { columnWidth: '45%', borderRadius: 3, borderRadiusApplication: 'end' },
  };
  protected monthlyChartLegend: ApexLegend = CHART_LEGEND;
  protected monthlyChartStroke: ApexStroke = CHART_BORDERLESS;
  protected monthlyChartDataLabels: ApexDataLabels = CHART_NO_DATA_LABELS;
  protected monthlyChartGrid: ApexGrid = CHART_GRID;
  protected monthlyChartTooltip: ApexTooltip = CHART_TOOLTIP_CURRENCY;
  protected monthlyChartNoData: ApexNoData = { text: 'Sin cobros registrados' };
  protected monthlyChartXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  protected monthlyChartYaxis: ApexYAxis = {
    labels: { formatter: value => `Q ${Number(value).toLocaleString('es-GT')}` },
  };

  protected planChart: ApexChart = { type: 'bar', height: CHART_HEIGHT, fontFamily: CHART_FONT_FAMILY };
  protected planChartSeries: ApexAxisChartSeries = [];
  protected planChartColors: string[] = [];
  protected planChartPlotOptions: ApexPlotOptions = {
    bar: { horizontal: true, barHeight: '55%', borderRadius: 3, distributed: true },
  };
  protected planChartLegend: ApexLegend = { show: false };
  protected planChartStroke: ApexStroke = CHART_BORDERLESS;
  protected planChartDataLabels: ApexDataLabels = CHART_NO_DATA_LABELS;
  protected planChartGrid: ApexGrid = CHART_GRID;
  protected planChartXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  protected planChartTooltip: ApexTooltip = { enabled: false };
  protected planChartNoData: ApexNoData = { text: 'Sin clientes activos' };

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private router: Router,
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

    this.dashboardService.findAdmin(queryParams).subscribe({
      next: (dashboard) => {
        this.summary = dashboard.summary;
        this.monthLabel = dashboard.summary?.monthLabel ?? '';
        this.recentPayments = dashboard.recentPayments ?? [];
        this.recentActivities = dashboard.recentActivities ?? [];
        this.clientsByPlan = dashboard.clientsByPlan ?? [];

        this.buildMethodChart(dashboard.collectionsByMethod ?? []);
        this.buildMonthlyChart(dashboard.collectionsByMethodByMonth ?? []);
        this.buildPlanChart(this.clientsByPlan);
      },
      error: () => this.toastService.error('Error al cargar el dashboard.'),
    });
  }

  /** Donut of the selected month. Always the three methods, even at zero. */
  private buildMethodChart(collections: DashboardCollectionByMethod[]): void {
    const ordered = orderCollectionsByMethod(collections);

    this.collectionsByMethod = ordered;
    this.methodChartSeries = ordered.map(collection => collection.total);
    this.methodChartLabels = ordered.map(collection => getPaymentMethodLabel(collection.methodName));
    this.methodChartColors = ordered.map(collection => getPaymentMethodColor(collection.methodName));
  }

  /** Stacked bars: one serie per payment method, one point per month. */
  private buildMonthlyChart(months: DashboardCollectionsByMonth[]): void {
    const series = buildMonthlyCollectionSeries(months);

    this.monthlyChartSeries = series.series;
    this.monthlyChartColors = series.colors;
    this.monthlyChartXaxis = {
      categories: series.labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    };
  }

  /** Horizontal bars of active clients per plan, sorted descending. */
  private buildPlanChart(plans: DashboardClientByPlan[]): void {
    const series = buildClientsByPlanSeries(plans);

    this.planChartSeries = [{ name: 'Clientes activos', data: series.data }];
    this.planChartColors = series.colors;
    this.planChartXaxis = {
      categories: series.labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    };
    this.planChartDataLabels = {
      enabled: true,
      formatter: value => String(value ?? 0),
    };
  }

  /** Open the audit detail of the activity, when the entity is known. */
  activityActions(log: AppAuditLog): TableRowCustomAction[] {
    if (!log.entityHashId) return [];

    return [
      {
        label: 'Ver auditoría',
        icon: 'history',
        action: () =>
          void this.router.navigate([
            '/audit',
            String(log.entityType),
            log.entityHashId,
            String(log.id),
          ]),
      },
    ];
  }
}