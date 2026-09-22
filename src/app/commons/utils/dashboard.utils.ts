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
} from 'ng-apexcharts';

import {
  DashboardClientByPlan,
  DashboardCollectionByMethod,
  DashboardCollectionsByMonth,
  PaymentMethodEnum,
} from '../../model/dashboard.model';

const CHART_FONT_FAMILY = 'Inter, system-ui, sans-serif';
const CHART_HEIGHT = 300;

const PAYMENT_METHOD_LABEL: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: 'Efectivo',
  [PaymentMethodEnum.TRANSFER]: 'Transferencia',
  [PaymentMethodEnum.CARD]: 'Tarjeta',
};

/** Chart palette, aligned with the `np-badge` colors of each method. */
const PAYMENT_METHOD_COLOR: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: '#15803D',
  [PaymentMethodEnum.TRANSFER]: '#1E5CE6',
  [PaymentMethodEnum.CARD]: '#B45309',
};

const PLAN_CHART_COLOR: readonly string[] = [
  '#1E5CE6',
  '#15803D',
  '#B45309',
  '#7C3AED',
  '#0E7490',
  '#BE123C',
];

/** Ordered methods used by every chart legend, so the colors never shift. */
const PAYMENT_METHOD_ORDER: readonly PaymentMethodEnum[] = [
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.TRANSFER,
  PaymentMethodEnum.CARD,
];

const LEGEND: ApexLegend = { position: 'bottom', fontSize: '13px', markers: { strokeWidth: 10 } };
const NO_DATA_LABELS: ApexDataLabels = { enabled: false };
const BORDERLESS: ApexStroke = { show: false };
const GRID: ApexGrid = { borderColor: '#F1F5F9', strokeDashArray: 4 };
const TOOLTIP_CURRENCY: ApexTooltip = { y: { formatter: value => formatCurrency(value) } };

/** Options of a donut of collections by payment method. */
export interface MethodChartConfig {
  chart: ApexChart;
  series: ApexNonAxisChartSeries;
  labels: string[];
  colors: string[];
  stroke: ApexStroke;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  noData: ApexNoData;
}

/** Options of the stacked bars of collections per month. */
export interface MonthlyChartConfig {
  chart: ApexChart;
  series: ApexAxisChartSeries;
  colors: string[];
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  noData: ApexNoData;
}

/** Options of the horizontal bars of active clients per plan. */
export interface PlanChartConfig {
  chart: ApexChart;
  series: ApexAxisChartSeries;
  colors: string[];
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  noData: ApexNoData;
}

export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

/**
 * Visible label of a payment method, translated from the stable `methodName`
 * key (`CASH`, `TRANSFER`, `CARD`) because `methodDescription` comes in English.
 * Avoid using this directly in an HTML template.
 */
export function getPaymentMethodLabel(methodName: string | null | undefined): string {
  const key = methodName as PaymentMethodEnum;
  return PAYMENT_METHOD_LABEL[key] ?? methodName ?? '—';
}

/** Chart color of a payment method. Avoid using this directly in an HTML template. */
export function getPaymentMethodColor(methodName: string | null | undefined): string {
  return PAYMENT_METHOD_COLOR[methodName as PaymentMethodEnum] ?? '#94A3B8';
}

/**
 * The three payment methods of a single month, always in the same order, so the
 * donut legend and the monthly bar series line up with each other.
 */
export function orderCollectionsByMethod(
  collections: DashboardCollectionByMethod[],
): DashboardCollectionByMethod[] {
  return PAYMENT_METHOD_ORDER.map(methodName => {
    return (
      collections.find(collection => collection.methodName === methodName) ?? {
        methodId: 0,
        methodName,
        methodDescription: '',
        total: 0,
        count: 0,
      }
    );
  });
}

/**
 * Transforms `collectionsByMethodByMonth` into the series of a stacked bar
 * chart: one serie per payment method, one point per month.
 */
function buildMonthlySeries(months: DashboardCollectionsByMonth[]): {
  labels: string[];
  series: { name: string; data: number[] }[];
  colors: string[];
} {
  return {
    labels: months.map(month => month.label),
    colors: PAYMENT_METHOD_ORDER.map(methodName => getPaymentMethodColor(methodName)),
    series: PAYMENT_METHOD_ORDER.map(methodName => ({
      name: getPaymentMethodLabel(methodName),
      data: months.map(month => {
        const found = month.methods.find(method => method.methodName === methodName);
        return found?.total ?? 0;
      }),
    })),
  };
}

/** Donut of the selected month. Always the three methods, even at zero. */
export function buildMethodChart(collections: DashboardCollectionByMethod[]): MethodChartConfig {
  const ordered = orderCollectionsByMethod(collections);

  return {
    chart: { type: 'donut', height: CHART_HEIGHT, fontFamily: CHART_FONT_FAMILY },
    series: ordered.map(collection => collection.total),
    labels: ordered.map(collection => getPaymentMethodLabel(collection.methodName)),
    colors: ordered.map(collection => getPaymentMethodColor(collection.methodName)),
    stroke: { width: 2, colors: ['#FFFFFF'] },
    legend: LEGEND,
    dataLabels: NO_DATA_LABELS,
    plotOptions: { pie: { donut: { size: '68%', labels: { show: true } } } },
    tooltip: TOOLTIP_CURRENCY,
    noData: { text: 'Sin cobros en el periodo' },
  };
}

/** Stacked bars: one serie per payment method, one point per month. */
export function buildMonthlyChart(months: DashboardCollectionsByMonth[]): MonthlyChartConfig {
  const series = buildMonthlySeries(months);

  return {
    chart: { type: 'bar', height: CHART_HEIGHT, fontFamily: CHART_FONT_FAMILY, stacked: true },
    series: series.series,
    colors: series.colors,
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 3, borderRadiusApplication: 'end' } },
    stroke: BORDERLESS,
    dataLabels: NO_DATA_LABELS,
    legend: LEGEND,
    xaxis: { categories: series.labels, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: value => `Q ${Number(value).toLocaleString('es-GT')}` } },
    grid: GRID,
    tooltip: TOOLTIP_CURRENCY,
    noData: { text: 'Sin cobros registrados' },
  };
}

/** Horizontal bars of active clients per plan, sorted descending. */
export function buildPlanChart(plans: DashboardClientByPlan[]): PlanChartConfig {
  const sorted = [...plans].sort((a, b) => b.activeClients - a.activeClients);

  return {
    chart: { type: 'bar', height: CHART_HEIGHT, fontFamily: CHART_FONT_FAMILY },
    series: [{ name: 'Clientes activos', data: sorted.map(plan => plan.activeClients) }],
    colors: sorted.map((_, index) => PLAN_CHART_COLOR[index % PLAN_CHART_COLOR.length]),
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 3, distributed: true } },
    stroke: BORDERLESS,
    dataLabels: { enabled: true, formatter: value => String(value ?? 0) },
    legend: { show: false },
    xaxis: {
      categories: sorted.map(plan => plan.planName),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: GRID,
    tooltip: { enabled: false },
    noData: { text: 'Sin clientes activos' },
  };
}