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
  OperationsDashboard,
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
import { getAuditActionLabel, getAuditEntityLabel, getAuditLevelClass, getAuditLevelLabel } from '../../../commons/utils/audit.utils';
import {
  buildMethodChart,
  buildMonthlyChart,
  buildPlanChart,
  getPaymentMethodColor,
  getPaymentMethodLabel,
  orderCollectionsByMethod,
} from '../../../commons/utils/dashboard.utils';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.scss',
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
export class DashboardOverviewComponent implements OnInit {
  protected readonly getAuditLevelClass = getAuditLevelClass;
  protected readonly getAuditLevelLabel = getAuditLevelLabel;
  protected readonly getAuditEntityLabel = getAuditEntityLabel;
  protected readonly getAuditActionLabel = getAuditActionLabel;
  protected readonly getPaymentMethodLabel = getPaymentMethodLabel;
  protected readonly getPaymentMethodColor = getPaymentMethodColor;

  protected year: number = new Date().getFullYear();
  protected month: number = new Date().getMonth() + 1;

  protected summary: OperationsDashboard['summary'] | null = null;
  protected monthLabel: string = '';

  protected recentPayments: AppPayment[] = [];
  protected recentActivities: AppAuditLog[] = [];
  protected clientsByPlan: DashboardClientByPlan[] = [];
  protected collectionsByMethod: DashboardCollectionByMethod[] = [];

  // `apx-chart` takes one input per option group. They are plain fields on
  // purpose: a getter returning a new array on every change detection cycle
  // would make ApexCharts redraw the charts constantly.
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

  protected planChart: ApexChart = { type: 'bar', height: 300, fontFamily: 'Inter, system-ui, sans-serif' };
  protected planChartSeries: ApexAxisChartSeries = [];
  protected planChartColors: string[] = [];
  protected planChartPlotOptions: ApexPlotOptions = {
    bar: { horizontal: true, barHeight: '55%', borderRadius: 3, distributed: true },
  };
  protected planChartLegend: ApexLegend = { show: false };
  protected planChartStroke: ApexStroke = { show: false };
  protected planChartDataLabels: ApexDataLabels = { enabled: false };
  protected planChartGrid: ApexGrid = { borderColor: '#F1F5F9', strokeDashArray: 4 };
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

    this.dashboardService.findOverview(queryParams).subscribe({
      next: (dashboard) => {
        this.summary = dashboard.summary;
        this.monthLabel = dashboard.summary?.monthLabel ?? '';
        this.recentPayments = dashboard.recentPayments ?? [];
        this.recentActivities = dashboard.recentActivities ?? [];
        this.clientsByPlan = dashboard.clientsByPlan ?? [];

        this.applyMethodChart(dashboard.collectionsByMethod ?? []);
        this.applyMonthlyChart(dashboard.collectionsByMethodByMonth ?? []);
        this.applyPlanChart(this.clientsByPlan);
      },
      error: () => this.toastService.error('Error al cargar el dashboard.'),
    });
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

  private applyPlanChart(plans: DashboardClientByPlan[]): void {
    const config = buildPlanChart(plans);

    this.planChart = config.chart;
    this.planChartSeries = config.series;
    this.planChartColors = config.colors;
    this.planChartPlotOptions = config.plotOptions;
    this.planChartStroke = config.stroke;
    this.planChartDataLabels = config.dataLabels;
    this.planChartLegend = config.legend;
    this.planChartXaxis = config.xaxis;
    this.planChartGrid = config.grid;
    this.planChartTooltip = config.tooltip;
    this.planChartNoData = config.noData;
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
